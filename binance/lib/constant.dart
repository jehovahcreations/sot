import 'package:socket_io_client/socket_io_client.dart';

var apiUrl = "http://192.168.1.103:3000/api";
var socketUrl = "http://192.168.1.103:3000";
var apiKey = "iUM7rnj6EbJCq3Mgs3FjQwI687zjgVlLZH6ZMmhXjpclN3MB6YXaBPcYKhGyyER8";
var apiSecret =
    "r2qDcwEOTwic7EX42O52CoafvVuUTTlMuA6hH5vv4NnNkEBtT1hKtyvXcjSV3sfd";
late Socket socket;
