import 'package:flutter/material.dart';

/// SnackBars, Bottom Sheets e Dialogs não são widgets que se colocam na
/// árvore — em Flutter são chamados imperativamente. Centralizar aqui a
/// aparência (cantos arredondados, espaçamento, cores do tema) garante
/// que qualquer feature os usa da mesma forma, sem repetir estilos.

void showAppSnackBar(BuildContext context, String message, {bool isError = false}) {
  final theme = Theme.of(context);
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? theme.colorScheme.error : theme.colorScheme.onSurface,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
      ),
    );
}

Future<T?> showAppBottomSheet<T>(BuildContext context, {required Widget Function(BuildContext) builder}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).colorScheme.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (context) => SafeArea(
      child: Padding(padding: const EdgeInsets.all(20), child: builder(context)),
    ),
  );
}

Future<bool?> showAppConfirmDialog(
  BuildContext context, {
  required String title,
  required String description,
  String confirmLabel = 'Confirmar',
  String cancelLabel = 'Cancelar',
}) {
  return showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(title),
      content: Text(description),
      actions: [
        TextButton(onPressed: () => Navigator.of(context).pop(false), child: Text(cancelLabel)),
        FilledButton(onPressed: () => Navigator.of(context).pop(true), child: Text(confirmLabel)),
      ],
    ),
  );
}

Future<void> showAppSuccessDialog(
  BuildContext context, {
  required String title,
  required String description,
  String closeLabel = 'Continuar',
}) {
  return showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      icon: const Icon(Icons.check_circle, color: Colors.green, size: 40),
      title: Text(title, textAlign: TextAlign.center),
      content: Text(description, textAlign: TextAlign.center),
      actions: [
        Center(
          child: FilledButton(onPressed: () => Navigator.of(context).pop(), child: Text(closeLabel)),
        ),
      ],
    ),
  );
}

Future<void> showAppErrorDialog(
  BuildContext context, {
  String title = 'Algo correu mal',
  required String description,
  String closeLabel = 'Fechar',
}) {
  final theme = Theme.of(context);
  return showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      icon: Icon(Icons.error, color: theme.colorScheme.error, size: 40),
      title: Text(title, textAlign: TextAlign.center),
      content: Text(description, textAlign: TextAlign.center),
      actions: [
        Center(
          child: TextButton(onPressed: () => Navigator.of(context).pop(), child: Text(closeLabel)),
        ),
      ],
    ),
  );
}
