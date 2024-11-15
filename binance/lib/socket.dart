import 'package:binance/constant.dart';
import 'package:socket_io_client/socket_io_client.dart';

initilizeSocket() {
  socket = io(socketUrl, <String, dynamic>{
    "transports": ["websocket"],
    "autoConnect": true
  });
  socket.connect();
  socket.onConnect((data) => print(socket.id));
}
