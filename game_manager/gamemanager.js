var roomlist = [];
var database = null;
var io;
var roommanager = require("../room_manager/roommanager");
var dateFormat = require("dateformat");
const { emit } = require("nodemon");
var socketlist = [];
var vip_sockets = [];
var socket_with_user_list = [];
var vip_socket_list = new Map();
var disconect_ids = [];
// const io = require("socket.io")(server);

exports.initdatabase = function (db) {
  database = db;
  setTimeout(() => {
    let collection = database.collection("userdatas");
    collection.find().toArray(function (err, docs) {
      if (!err) {
        if (docs.length > 0) {
          for (let i = 0; i < docs.length; i++) {
            const element = docs[i];

            let query = { userid: element.userid };
            collection.updateOne(
              query,
              {
                $set: {
                  connect: "",
                },
              },
              function (err) {
                if (err) throw err;
              }
            );
          }
        }
      }
    });
  }, 3000);
};
exports.addsocket = function (id) {
  socketlist.push(id);
};

// VIPSGrow
exports.add_vip_socket_list = function (socket, id) {
  console.log("Call add vip socket list");
  vip_socket_list.set(id, socket);
  vip_sockets.push({ id, socket, connected: true });
};

exports.addSocketUserList = function (id, userid) {
  socket_with_user_list.push({ s_id: id, userid: userid });
};
// VIPSGrow
exports.setsocketio = function (socketio) {
  io = socketio;
};

exports.getroomlist = function () {
  return roomlist;
};
exports.getroom = function (r_roomID) {
  let roominfo = null;
  for (i = 0; i < roomlist.length; i++) {
      if (roomlist[i].roomid == r_roomID) {
          roominfo = roomlist[i];
          break;
      }
  }
  return roominfo;
}

exports.ReduceEmojiPrice = function (socket, data) {
  let currentDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Calcutta",
  });
  let timel = dateFormat(currentDate, "dddd mmmm dS yyyy h:MM:ss TT");

  console.log(
    "&&&&**********&&&" +
      data.userId +
      "&&&&&&&&&&**************" +
      data.emojiPrice
  );
  let userId = data.userId;
  let points = data.points;
  let winningAmount = data.winAmount;
  let query1 = { userid: userId };
  let query2 = { $set: { points: points, winning_amount: winningAmount } };

  let collection = database.collection("userdatas");
  let chathiscolletion = database.collection("chathistorys");
  collection.updateOne(query1, query2, function (err, result) {
    if (err) console.log(err);
    else {
      //now insert transaction history

      var ChatHostory = {
        userid: userId,
        amount: data.emojiPrice,
        created_at: timel,
      };
      chathiscolletion.insertOne(ChatHostory);
      console.log("One Document Updated.");
    }
  });
};

exports.addroom = function (r_roomID, r_title, r_creator, r_username, r_tournament_id, r_jackpot_id, r_seatlimit, r_status, r_game_mode, r_wifi_mode, r_stake_money, r_win_money, r_refresh_time, r_refresh_interval, socket) {
  let inputplayerlist = [];
  let inputnamelist = [];
  let playerphotos = [];
  let earnScore = [];
  let diceHistory = [];
  let gameobject = {
      roomid: r_roomID,
      title: r_title,
      creator: r_creator,
      username: r_username,
      tournament_id: r_tournament_id,
      seatlimit: parseInt(r_seatlimit),
      status: r_status,
      game_mode: r_game_mode,
      wifi_mode: r_wifi_mode,
      stake_money: r_stake_money,
      win_money: r_win_money,
      playerlist: inputplayerlist,
      namelist: inputnamelist,
      playerphotos: playerphotos,
      earnScores: earnScore,
      dice: 1,
      turnuser: '',
      diceHistory: diceHistory,
      turncount: [],
      refresh_time: r_refresh_time,
      refresh_interval: r_refresh_interval,
      start_status: "",
      jackpot_id: r_jackpot_id,
      move_history: {
          status: '',
          mover: '',
          path: ''
      },
  }
  roomlist.push(gameobject);
}

exports.GetRoomPassedTime = function (socket, data) {
  for (let index = 0; index < roomlist.length; index++) {
      if (roomlist[index].roomid == data.roomid) {
          roomlist[index].passedtime = parseFloat(data.passedtime);
      }
  }
}

exports.playerenterroom = function (roomid, userid, jackpot_id, username, photo, socket) {

      
  socket.room = 'r' + roomid;
  socket.userid = userid;
  //socket.nickname = username;
  console.log("----- player joined in room No: " + socket + " ------");
  socket.join('r' + roomid);

  if (roomlist.length > 0) {
      var sum_players = 0;
      for (let index = 0; index < roomlist.length; index++) {
          if (roomlist[index].roomid == roomid) {
              if (roomlist[index].wifi_mode == "jackpot") {
                  if (jackpot_id != roomlist[index].jackpot_id)
                      return;
              }
              
              for (let i = 0; i < roomlist[index].playerlist.length; i++) {
                  let id = roomlist[index].playerlist[i].userid;
                  if (id == userid) {
                      let mydata = {
                          result: "failed"
                      }
                      console.log('--- userid ' + userid + ' joined already in room ---');
                      socket.emit('REQ_ENTER_ROOM_RESULT', mydata);
                      return;
                  }
              }

              roomlist[index].playerlist.push({ userid: userid, isIgnored: false, moved: "", statics: "", completed: "", timechance: "0" });
              roomlist[index].namelist.push(username);
              roomlist[index].playerphotos.push(photo);
              roomlist[index].earnScores.push(0);

              exports.GetUserListInRoom(roomid);

              if (roomlist[index].playerlist.length == roomlist[index].seatlimit) {
                  // start game
                  roomlist[index].turnuser = userid;
                  console.log('----- GameRoom is full players');
                  let mydata = {
                      result: "success"
                  }
                  if (roomlist[index].wifi_mode == "privateRoom") {
                      console.log('-------Private Room Start--------');
                      io.sockets.in('r' + roomid).emit('REQ_ENTER_ROOM_RESULT', mydata);
                  }
                  if (roomlist[index].wifi_mode == "jackpot") {
                      console.log('-------Jackpot Room Start --------');
                      io.sockets.in('r' + roomid).emit('REQ_ENTER_ROOM_RESULT', mydata);
                  }

                  roomlist[index].status = "full";
                  UpdateRoomStatus(roomid);
              }
          }
      }
  }

  // roommanager.GetRoomList();
}

exports.reconnectRoom = function (roomid, username, userid, old_socketID, socket) {

  let roomindex = 0;
  for (let index = 0; index < roomlist.length; index++) {
      if (roomlist[index].roomid == roomid) {
          roomindex = index;
      }
  }
  if (roomlist[roomindex] == null) return;
  let ischeck = roomlist[roomindex].playerlist.filter(function (object) {
      return (object.userid == userid)
  });

  if (ischeck.length == 0) {
      let emitdata = {
          message: "exitUser"
      }
      socket.emit('EXIT_GAME', emitdata);
      console.log("You already got disconnection");
  }
  else {
      socketlist.splice(socketlist.indexOf(old_socketID), 1);
      //console.log("reconn", roomid, username);
      socket.room = 'r' + roomid;
      socket.userid = userid;
      socket.username = username;
      socket.join('r' + roomid);
      let emit_data = {
          roomid: roomid,
          reconnecter: userid,
          status: roomlist[roomindex].move_history.status,
          mover: roomlist[roomindex].move_history.mover,
          path: roomlist[roomindex].move_history.path
      }
      io.sockets.in('r' + roomid).emit('RECONNECT_RESULT', emit_data);
  }
}
exports.GetUserListInRoom = function (roomid) {
  let roomindex = 0;
  let mydata = '';
  for (let index = 0; index < roomlist.length; index++) {
      if (roomlist[index].roomid == roomid) {
          roomindex = index;
      }
  }
  for (let i = 0; i < roomlist[roomindex].namelist.length; i++) {
      mydata = mydata + '{' +
          '"userid":"' + roomlist[roomindex].playerlist[i].userid + '",' +
          '"username":"' + roomlist[roomindex].namelist[i] + '",' +
          '"photo":"' + roomlist[roomindex].playerphotos[i] + '",' +
          '"points":"' + 0 + '",' +
          '"level":"' + 0 + '"},';
  }
  mydata = mydata.substring(0, mydata.length - 1);
  mydata = '{' +
      '"result":"success",' +
      '"roomid":"' + roomid + '",' +
      '"userlist": [' + mydata;
  mydata = mydata + ']}';
  //console.log('---REQ_USERLIST_ROOM_RESULT---  ', JSON.parse(mydata));
  console.log("roomid ====== ", roomid);
  io.sockets.in('r' + roomid).emit('REQ_USERLIST_ROOM_RESULT', JSON.parse(mydata));
}
exports.AddHistory = function (data) {
  let collection = database.collection("gamehistorys");
  // let currentDate = new Date();
  let currentDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Calcutta",
  });
  let currentTime = dateFormat(currentDate, "dddd mmmm dS yyyy h:MM:ss TT");
  let query = {
    userid: data.userid,
    username: data.username,
    creater: data.creater,
    seat_limit: data.seat_limit,
    type: "Gameplay",
    game_mode: data.gamemode,
    stake_money: data.stake_money,
    game_status: data.game_status,
    win_money: data.win_money,
    playing_time: currentTime,
    created_at: currentDate,
  };

  collection.insertOne(query, function (err) {
    if (!err) {
      console.log(
        "@@@@@@@@@@@@@ ++++++++++ history info added ++++++++++++++ @@@@@@@@@@@@@@@@"
      );
    } else {
      console.log("history info not added");
    }
  });
};

function GetThisWeek() {
  let curr = new Date();
  let week = [];

  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i;
    let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
    week.push(day);
    //console.log('*** ', day);
  }
  return week;
}

function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  _hours = hours < 10 ? "0" + hours : hours;
  _minutes = minutes < 10 ? "0" + minutes : minutes;
  _seconds = seconds < 10 ? "0" + seconds : seconds;
  console.log(
    "Spin Remaining: ",
    _hours + ":" + _minutes + ":" + _seconds + "." + milliseconds
  );
  let datajson = {
    result: "remaining",
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
  return datajson;
}

exports.GetTurnUser = function (socket, data) {
  console.log("ASK TURN USER");
  //   console.log(roomlist);
  //   console.log(data);
  //   console.log("------data end-----");
  let networkErrData = {};
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == data.roomid) {
      let username = data.username;
      let userid = data.userid;
      let room_id = data.roomid;
      let turn_user = data.turnuser != undefined ? data.turnuser : 0;
      for (let j = 0; j < roomlist[index].playerlist.length; j++) {
        if (data.pawns_moved != undefined) {
          const element = roomlist[index].playerlist[j];
          if (element.userid == userid) {
            element.moved = data.pawns_moved;
            element.statics = data.pawns_statics;
            element.completed = data.pawns_completed;
            console.log("time chance - " + data.myTimechance);
            if (data.myTimechance == "") {
              element.timechance = "0";
            } else {
              if (parseInt(element.timechance) < parseInt(data.myTimechance))
                element.timechance = data.myTimechance;
            }
          }
        }
        if (data.pawns_turn_moved != undefined) {
          const element = roomlist[index].playerlist[j];
          if (element.userid == turn_user) {
            networkErrData = element;
            element.moved = data.pawns_turn_moved;
            element.statics = data.pawns_turn_statics;
            element.completed = data.pawns_turn_completed;
            if (data.turnuserTimechance == "") {
              element.timechance = "0";
            } else {
              if (
                parseInt(element.timechance) < parseInt(data.turnuserTimechance)
              )
                element.timechance = data.turnuserTimechance;
            }
          }
        }
      }
      //console.log(username);
      console.log("turncount  before : ", roomlist[index].turncount);
      let ischeck = roomlist[index].turncount.filter(function (object) {
        return object == userid;
      });
      console.log("ischeck: ", ischeck);
      if (ischeck.length == 0) roomlist[index].turncount.push(userid);
      console.log("roomlist[index].turncount : ", roomlist[index].turncount);
      let takenUsers = roomlist[index].playerlist.filter(
        (p) => p.isIgnored == false
      );
      if (
        roomlist[index].turncount.length == roomlist[index].seatlimit ||
        roomlist[index].turncount.length == takenUsers.length
      ) {
        //
        //if(true){
        roomlist[index].dice = parseInt(data.dice);
        SetTurn(index, data.roomid);
        console.log("Decide Turn");
      } else {
        console.log("Second player is not connected to network");

        

        

      }
      break;
    }
  }
};

var sixCount = 0;
function SetTurn(index, roomid) {
  console.log("-----set turn function callled -----");
  if (roomlist[index].dice < 6) {
    let turnuser = roomlist[index].turnuser;
    let takenUsers = roomlist[index].playerlist; //.filter(p => p.isIgnored == false);

    for (let i = 0; i < takenUsers.length; i++) {
      if (takenUsers[i].userid == turnuser) {
        isFounded = true;
        if (i == takenUsers.length - 1) {
          i = 0;
        } else {
          i++;
        }
        turnuser = takenUsers[i].userid;
        roomlist[index].turnuser = turnuser;
      }
    }
  }
  setTimeout(() => {
    console.log("user check call - ");
    // console.log(roomlist[index].playerlist);
    if (roomlist[index].playerlist == null) return;
    let takenUsers = roomlist[index].playerlist; //.filter(p => p.isIgnored == false);
    if (takenUsers.length > 0) {
      let value = randomNum(1, 6);

      if (value == 6) sixCount++;
      else sixCount = 0;

      // console.log('sixCount --> ', sixCount);

      if (sixCount == 3) {
        value = randomNum(1, 5);
        sixCount = 0;
      }

      // console.log('diceValue --> ', value);

      roomlist[index].dice = value;
      let mydata = "";
      for (let i = 0; i < roomlist[index].playerlist.length; i++) {
        mydata =
          mydata +
          "{" +
          '"userid":"' +
          roomlist[index].playerlist[i].userid +
          '",' +
          '"isIgnored":"' +
          roomlist[index].playerlist[i].isIgnored +
          '",' +
          '"timechance":"' +
          roomlist[index].playerlist[i].timechance +
          '",' +
          '"moved":"' +
          roomlist[index].playerlist[i].moved +
          '",' +
          '"statics":"' +
          roomlist[index].playerlist[i].statics +
          '",' +
          '"completed":"' +
          roomlist[index].playerlist[i].completed +
          '"},';
      }
      mydata = mydata.substring(0, mydata.length - 1);
      mydata =
        "{" +
        '"turnuser":"' +
        roomlist[index].turnuser +
        '",' +
        '"dice":"' +
        roomlist[index].dice +
        '",' +
        '"allusers": [' +
        mydata;
      mydata = mydata + "]}";
      console.log(mydata);
      // let turndata = {
      //     turnuser: roomlist[index].turnuser,
      //     dice: roomlist[index].dice,
      //     allusers : roomlist[index].playerlist
      // }
      roomlist[index].turncount = [];
      //io.sockets.in('r' + roomid).emit('REQ_TURNUSER_RESULT', turndata);
      //console.log('TURN_DATA : ', turndata);
      setTimeout(() => {
        io.sockets
          .in("r" + roomid)
          .emit("REQ_TURNUSER_RESULT", JSON.parse(mydata));
      }, 400);
    }
  }, 100);
}

function UpdateRoomStatus(roomid) {
  var collection = database.collection("roomdatas");
  var query = {
    roomID: roomid,
  };

  collection.findOne(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      collection.updateOne(
        query,
        {
          $set: {
            status: "full",
          },
        },
        function (err) {
          if (err) throw err;
        }
      );
    }
  });
}

function randomNum(min, max) {
  var random = Math.floor(Math.random() * (max - min + 1) + min);
  return random;
}

exports.ChatMessage = function (socket, data) {
  var mydata = {
    result: "success",
    username: data.username,
    message: data.message,
  };
  //socket.in('r' + data.roomid).emit('REQ_CHAT_RESULT', mydata);
  io.sockets.in("r" + data.roomid).emit("REQ_CHAT_RESULT", mydata);
};

exports.Roll_Dice = function (socket, data) {
  var roomid = data.roomid;
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      if (roomlist[index].dice == data.dice) {
        var mydata = {
          roller: data.roller,
          dice: data.dice,
        };
        //console.log("REQ_ROLL_DICE_RESULT", roomid, data.roller, data.dice);
        socket.in("r" + roomid).emit("REQ_ROLL_DICE_RESULT", mydata);
        break;
      } else {
        console.log(data.roller, "is Hacker");
      }
    }
  }
};
exports.Move_Token = function (socket, data) {
  var roomid = data.roomid;
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      var mydata = {
        status: data.status,
        mover: data.mover,
        path: data.path,
      };
      roomlist[index].move_history.status = data.status;
      roomlist[index].move_history.mover = data.mover;
      roomlist[index].move_history.path = data.path;
      socket.in("r" + roomid).emit("REQ_MOVE_TOKEN_RESULT", mydata);
      console.log(roomlist[index].move_history);
      break;
    }
  }
};

exports.SendTimeUpSocket = function (socket, data) {
  var roomid = data.roomid;
  var userid = data.userid;
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      console.log("--------- REQ_TIME_UP_RESULT ---------");
      var mydata = { userid: data.userid };
      socket.in("r" + roomid).emit("REQ_TIME_UP_RESULT", mydata);
      break;
    }
  }
};

exports.Set_Auto = function (socket, data) {
  let roomid = data.roomid;
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      var mydata = {
        user: data.user,
        auto: data.auto,
      };
      socket.in("r" + roomid).emit("REQ_AUTO_RESULT", mydata);
      break;
    }
  }
};
exports.LeaveRoom = function (socket, data) {
  let mydata = {
      result: "success",
      username: data.username,
      userid: data.userid,
      message: "user has left the room"
  };

  io.sockets.in('r' + data.roomid).emit('REQ_LEAVE_ROOM_RESULT', mydata);
  // socket.in('r' + data.roomid).emit('REQ_LEAVE_ROOM_RESULT', mydata);
  socket.leave('r' + data.roomid);
  console.log(data.userid, "has ", data.roomid, "room exit");

  if (roomlist.length > 0) {
      let removeindex = null;
      for (let index = 0; index < roomlist.length; index++) {
          if (roomlist[index].roomid == data.roomid) {
              let num;
              let isExist = false;
              for (let i = 0; i < roomlist[index].playerlist.length; i++) {
                  if (roomlist[index].playerlist[i].userid == data.userid) {
                      isExist = true;
                      num = i
                      break;
                  }
              }
              if (isExist == true) {

                  roomlist[index].seatlimit--;
                  //console.log('seatlimit : ', roomlist[index].seatlimit);

                  if (roomlist[index].turnuser == data.userid) {
                      console.log('is changing turn');
                      SetTurn(index, data.roomid);
                  }

                  setTimeout(() => {
                      if (roomlist[index] != undefined) {
                          roomlist[index].playerlist.splice(num, 1);
                          roomlist[index].playerphotos.splice(num, 1);
                          roomlist[index].namelist.splice(num, 1);
                          roomlist[index].earnScores.splice(num, 1);

                          //exports.GetUserListInRoom(data.roomid);
                          if (roomlist[index].playerlist.length == 0) {
                              removeindex = index;
                              if (removeindex != null) {
                                  roomlist.splice(removeindex, 1);
                                  let query = {
                                      roomID: parseInt(data.roomid)
                                  }
                                  let collection = database.collection('roomdatas');
                                  collection.deleteOne(query, function (err, removed) {
                                      if (err) {
                                          console.log(err);
                                      } else {
                                          console.log('roomID:' + data.roomid + ' has removed successfully!');
                                      }
                                  });
                                  //roommanager.GetRoomList();
                              }
                          } else if (roomlist[index].playerlist.length == 1) {
                              console.log("STOP! Everyone not me outsided~");
                              io.sockets.in('r' + data.roomid).emit('GAME_END', { outerid: data.userid });
                          }
                      }
                  }, 200);
              }
          }
      }

  }
}
exports.RemoveRoom = function (socket, data) {
  console.log("Remove Force Room", data.roomid);
  let removeindex;
  for (let index = 0; index < roomlist.length; index++) {
      if (roomlist[index].roomid == data.roomid) {
          removeindex = index;
          roomlist.splice(removeindex, 1);
          let query = {
              roomID: parseInt(data.roomid)
          };
          let collection = database.collection('roomdatas');
          collection.deleteOne(query, function (err, removed) {
              if (err) {
                  console.log(err);
              } else {
                  console.log(data.roomid, 'room has removed successfully!');
              }
          });
      }
  }
}

exports.OnDisconnect = function (socket) {
  console.log("---- Disconnect -----", socket.room, socket.userid, socket.id);
  let userid = socket.id;

  console.log("socket list");
  console.log(socketlist);

  let is_id_check = socketlist.filter((obj) => {
    return obj == socket.id;
  });

  if (is_id_check.length == 0) {
  } else {
  }

  let websettings = database.collection("websettings");
  websettings.findOne({}, function (err, result) {
    let webdata;
    if (err) console.log(err);
    if (result != null) {
      if (parseInt(result.activeplayer) > 0) {
        websettings.updateOne(
          {},
          { $set: { activeplayer: parseInt(result.activeplayer) - 1 } },
          function (err) {
            if (err) throw err;
            else {
            }
          }
        );
      }
    }
  });
  let userdatas = database.collection("userdatas");
  userdatas.updateOne(
    { connect: userid },
    {
      $set: {
        login_status: "0",
      },
    }
  );

  let ischeck = socketlist.filter(function (object) {
    return object == socket.id;
  });

  if (ischeck.length == 0) {
    console.log("re-connected user");
  } else {
    disconect_ids.push(socket);

    socketlist.splice(socketlist.indexOf(socket.id), 1);
    vip_sockets = vip_sockets.filter((s_data) => {
      return s_data.id != socket.id;
    });
    let userid = socket.id;
    console.log("  leaving user's id : ", userid);
    let userdatas = database.collection("userdatas");
    userdatas.updateOne(
      { connect: userid },
      {
        $set: {
          status: 1,
          login_status: "0",
        },
      },
      function (err) {
        if (err) throw err;
        else {
          console.log("---- Disconnect User Status Updated -----");
        }
      }
    );

    if (socket.room == undefined || userid == undefined) return;

    let roomid_arr = socket.room.split("");
    roomid_arr.splice(0, 1);
    let roomid = "";
    for (let i = 0; i < roomid_arr.length; i++) {
      roomid += roomid_arr[i];
    }
    console.log("roomid : ", roomid);

    if (roomlist.length > 0) {
      let removeindex = null;
      for (let index = 0; index < roomlist.length; index++) {
        if (roomlist[index].roomid == roomid) {
          //console.log("yes");
          let num;
          let isExist = false;
          for (let i = 0; i < roomlist[index].playerlist.length; i++) {
            if (roomlist[index].playerlist[i].userid == userid) {
              isExist = true;
              //console.log("yes");
              num = i;
              break;
            }
          }
          if (isExist == true) {
            setTimeout(() => {
              roomlist[index].playerlist.splice(num, 1);
              roomlist[index].playerphotos.splice(num, 1);
              roomlist[index].earnScores.splice(num, 1);
              //exports.GetUserListInRoom(roomid);
              if (roomlist[index].playerlist.length == 0) {
                //console.log("yes");
                removeindex = index;
                if (removeindex != null) {
                  // console.log("yes");
                  roomlist.splice(removeindex, 1);
                  let query = {
                    roomID: parseInt(roomid),
                  };
                  let collection = database.collection("roomdatas");
                  collection.deleteOne(query, function (err, removed) {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log(roomid, "room has removed successfully!");
                    }
                  });
                  //roommanager.GetRoomList();
                }
              } else if (roomlist[index].playerlist.length == 1) {
                console.log("STOP", roomlist[index].roomid);
                //roommanager.GetRoomList();
                io.sockets
                  .in("r" + roomlist[index].roomid)
                  .emit("GAME_END", { outerid: socket.userid });
                //socket.in(socket.room).emit('GAME_END', {});
              }
            }, 100);
          }
        }
      }
    }
  }
};
function getConnectedList() {
  let list = [];

  for (let client in io.sockets.connected) {
    list.push(client);
  }

  return list;
}
exports.Pause_Game = function (socket, data) {
  let roomid = data.roomid;
  let outerName = data.outerName;
  let outerID = data.outerID;
  let emitdata = {
    roomid: roomid,
    outerName: outerName,
    outerid: outerID,
  };
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      let mine = roomlist[index].playerlist.filter((p) => p.userid == outerID);
      if (mine.length > 0) {
        mine[0].isIgnored = true;
        // if(roomlist[index].turnuser == outerID)
        // {
        //     SetTurn(index, roomid);
        // }
      }
    }
  }

  // socket.in('r' + roomid).emit('REQ_PAUSE_RESULT', emitdata);
  io.sockets.in("r" + roomid).emit("REQ_PAUSE_RESULT", emitdata);
};
exports.Resume_Game = function (socket, data) {
  let roomid = data.roomid;
  let outerName = data.outerName;
  let outerID = data.outerID;

  // let emitdata = {
  //     roomid : roomid
  // }
  for (let index = 0; index < roomlist.length; index++) {
    if (roomlist[index].roomid == roomid) {
      let mine = roomlist[index].playerlist.filter((p) => p.userid == outerID);
      if (mine.length > 0) {
        mine[0].isIgnored = false;
      }

      let mydata = "";
      for (let i = 0; i < roomlist[index].playerlist.length; i++) {
        mydata =
          mydata +
          "{" +
          '"userid":"' +
          roomlist[index].playerlist[i].userid +
          '",' +
          '"isIgnored":"' +
          roomlist[index].playerlist[i].isIgnored +
          '",' +
          '"timechance":"' +
          roomlist[index].playerlist[i].timechance +
          '",' +
          '"moved":"' +
          roomlist[index].playerlist[i].moved +
          '",' +
          '"statics":"' +
          roomlist[index].playerlist[i].statics +
          '",' +
          '"completed":"' +
          roomlist[index].playerlist[i].completed +
          '"},';
      }
      mydata = mydata.substring(0, mydata.length - 1);
      mydata =
        "{" +
        '"roomid":"' +
        roomid +
        '",' +
        '"outerID":"' +
        outerID +
        '",' +
        '"allusers": [' +
        mydata;
      mydata = mydata + "]}";
      // socket.in('r' + roomid).emit('REQ_RESUME_RESULT',  JSON.parse(mydata));
      io.sockets.in("r" + roomid).emit("REQ_RESUME_RESULT", JSON.parse(mydata));
      // let takenUsers = roomlist[index].playerlist.filter(p => p.isIgnored == false);
      // if(takenUsers.length == roomlist[index].seatlimit)
      // {
      //     SetTurn(index, roomid);
      // }
    }
  }
};
