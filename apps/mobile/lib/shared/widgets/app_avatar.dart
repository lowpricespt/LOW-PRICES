import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

class AppAvatar extends StatelessWidget {
  const AppAvatar({super.key, required this.name, this.imageUrl, this.size = 40});

  final String name;
  final String? imageUrl;
  final double size;

  String get _initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    final first = parts.first.substring(0, 1);
    final last = parts.length > 1 && parts.last.isNotEmpty ? parts.last.substring(0, 1) : '';
    return (first + last).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ClipOval(
      child: Container(
        width: size,
        height: size,
        color: theme.colorScheme.surface,
        alignment: Alignment.center,
        child: imageUrl != null
            ? CachedNetworkImage(
                imageUrl: imageUrl!,
                width: size,
                height: size,
                fit: BoxFit.cover,
                errorWidget: (context, url, error) => _InitialsLabel(initials: _initials),
              )
            : _InitialsLabel(initials: _initials),
      ),
    );
  }
}

class _InitialsLabel extends StatelessWidget {
  const _InitialsLabel({required this.initials});

  final String initials;

  @override
  Widget build(BuildContext context) {
    return Text(
      initials,
      style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
    );
  }
}
