import 'package:flutter/material.dart';
import 'logo_mark.dart';

class LogoHorizontal extends StatelessWidget {
  const LogoHorizontal({super.key, this.markSize = 32});

  final double markSize;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        LogoMark(size: markSize),
        const SizedBox(width: 10),
        Text('Low Prices', style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}
