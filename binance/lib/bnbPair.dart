import 'package:binance/constant.dart';
import 'package:flutter/material.dart';

class BnbPair extends StatefulWidget {
  const BnbPair({super.key});

  @override
  State<BnbPair> createState() => _BnbPairState();
}

class _BnbPairState extends State<BnbPair> {
  List bnbData = [];
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    socket.on("bnbPair", (data) => {getData(data)});
  }

  getData(data) {
    setState(() {
      bnbData = data;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
        itemCount: bnbData.length,
        itemBuilder: (BuildContext context, int Index) {
          return Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                  width: MediaQuery.of(context).size.width * 0.05,
                  child: Text(bnbData[Index]["asset"])),
              SizedBox(
                  width: MediaQuery.of(context).size.width * 0.05,
                  child: Text(bnbData[Index]["usd"].toString())),
             
              ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green, // Background color
                    foregroundColor: Colors.white, // Text color
                  ),
                  child: Text("Buy")),
              ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red, // Background color
                    foregroundColor: Colors.white, // Text color
                  ),
                  child: Text("Sell"))
            ],
          );
        });
  }
}
