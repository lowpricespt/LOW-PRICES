import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Réplica exata do símbolo usado em `apps/web/src/components/brand/logo-mark.tsx`.
/// As coordenadas do traço são as mesmas do SVG (viewBox 0 0 64 64), apenas
/// escaladas para o tamanho pedido — garante consistência total de marca
/// entre o website e a app.
class LogoMark extends StatelessWidget {
  const LogoMark({super.key, this.size = 32});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _LogoMarkPainter()),
    );
  }
}

class _LogoMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 64;

    final backgroundPaint = Paint()..color = AppColors.primary;
    final backgroundRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Radius.circular(16 * scale),
    );
    canvas.drawRRect(backgroundRect, backgroundPaint);

    final strokePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6 * scale
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    Offset p(double x, double y) => Offset(x * scale, y * scale);

    // Haste vertical (partilhada pelo L e pelo P)
    final stem = Path()
      ..moveTo(p(24, 46).dx, p(24, 46).dy)
      ..lineTo(p(24, 17).dx, p(24, 17).dy);
    canvas.drawPath(stem, strokePaint);

    // Laço do P
    final loop = Path()
      ..moveTo(p(24, 17).dx, p(24, 17).dy)
      ..cubicTo(
        p(34, 17).dx,
        p(34, 17).dy,
        p(40, 21).dx,
        p(40, 21).dy,
        p(40, 27).dx,
        p(40, 27).dy,
      )
      ..cubicTo(
        p(40, 33).dx,
        p(40, 33).dy,
        p(34, 36.5).dx,
        p(34, 36.5).dy,
        p(24, 36.5).dx,
        p(24, 36.5).dy,
      );
    canvas.drawPath(loop, strokePaint);

    // Pé do L
    final foot = Path()
      ..moveTo(p(24, 46).dx, p(24, 46).dy)
      ..lineTo(p(42, 46).dx, p(42, 46).dy);
    canvas.drawPath(foot, strokePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
