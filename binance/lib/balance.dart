import 'dart:math';

import 'package:binance/constant.dart';
import 'package:flutter/material.dart';

class Balance extends StatefulWidget {
  const Balance({super.key});

  @override
  State<Balance> createState() => _BalanceState();
}

class _BalanceState extends State<Balance> {
  List balanceData = [];
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    socket.emit("getAccount");
    socket.on("getAccount", (data) => {balance(data)});
  }

  balance(data) {
    setState(() {
      balanceData = data;
    });
    print(balanceData);
  }

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      scrollDirection: Axis.vertical,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: balanceData.length,
        // Number of items per row
      ),
      itemCount: balanceData.length, // Total number of items
      itemBuilder: (context, index) {
        return Container(
          height: 10,
          color: Colors.purple,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  balanceData[index]["asset"],
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  balanceData[index]["free"].toString() ?? "0",
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
                Text(
                  balanceData[index]["usd"].toString() ?? "0",
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
