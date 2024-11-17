import 'package:binance/balance.dart';
import 'package:binance/bnbPair.dart';
import 'package:flutter/material.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(children: [
          SizedBox(
            height: MediaQuery.of(context).size.width * 0.05,
            width: MediaQuery.of(context).size.width,
            child: const Balance(),
          ),
          Row(
            children: [
              SizedBox(
                height: MediaQuery.of(context).size.width * 0.8,
                width: MediaQuery.of(context).size.width*0.3,
                child: const BnbPair(),
              ),
            ],
          ),
          // Expanded(child: Balance()),
        
          // const Row(children: [Expanded(child: BnbPair(),),],),
        ]),
      ),
    );
  }
}
