import 'package:flutter/material.dart';
import 'app_feedback.dart';

Future<DateTime?> showAppDatePicker(
  BuildContext context, {
  DateTime? initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
}) {
  final now = DateTime.now();
  return showDatePicker(
    context: context,
    initialDate: initialDate ?? now,
    firstDate: firstDate ?? now,
    lastDate: lastDate ?? now.add(const Duration(days: 365)),
  );
}

Future<TimeOfDay?> showAppTimePicker(BuildContext context, {TimeOfDay? initialTime}) {
  return showTimePicker(context: context, initialTime: initialTime ?? TimeOfDay.now());
}

/// Bottom sheet "Câmara ou Galeria?" — a escolha real da imagem liga-se
/// ao `ImageService` (ainda stub); isto define só a interação padrão que
/// vamos reutilizar em qualquer sítio que precise de foto (perfil,
/// passo de Fotos do wizard, documentação do profissional).
Future<String?> showAvatarPickerSheet(
  BuildContext context, {
  required Future<String?> Function() onPickFromCamera,
  required Future<String?> Function() onPickFromGallery,
}) {
  return showAppBottomSheet<String?>(
    context,
    builder: (context) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ListTile(
          leading: const Icon(Icons.photo_camera_outlined),
          title: const Text('Tirar fotografia'),
          onTap: () async {
            final path = await onPickFromCamera();
            if (context.mounted) Navigator.of(context).pop(path);
          },
        ),
        ListTile(
          leading: const Icon(Icons.photo_library_outlined),
          title: const Text('Escolher da galeria'),
          onTap: () async {
            final path = await onPickFromGallery();
            if (context.mounted) Navigator.of(context).pop(path);
          },
        ),
      ],
    ),
  );
}
