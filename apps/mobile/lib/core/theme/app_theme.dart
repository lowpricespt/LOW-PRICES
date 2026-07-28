import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Paleta oficial da Low Prices. Os valores espelham exatamente os tokens
/// CSS definidos em `apps/web/src/styles/globals.css`, para que a app e o
/// website sejam visualmente indistinguíveis em termos de marca.
class AppColors {
  AppColors._();

  static const primary = Color(0xFFFF5A1F);
  static const primaryDark = Color(0xFFFF6A33);

  static const accentInfo = Color(0xFF2F6FED);
  static const success = Color(0xFF16A34A);
  static const destructive = Color(0xFFDC2626);

  // Light mode
  static const backgroundLight = Color(0xFFFFFFFF);
  static const foregroundLight = Color(0xFF1E2126);
  static const surfaceLight = Color(0xFFF4F5F7);
  static const borderLight = Color(0xFFE4E7EC);
  static const mutedForegroundLight = Color(0xFF6B7280);

  // Dark mode — cinza muito escuro, nunca preto absoluto
  static const backgroundDark = Color(0xFF17181A);
  static const foregroundDark = Color(0xFFF2F3F4);
  static const surfaceDark = Color(0xFF212226);
  static const borderDark = Color(0xFF34363B);
  static const mutedForegroundDark = Color(0xFFA0A3A9);
}

class AppTheme {
  AppTheme._();

  static ThemeData get light => _buildTheme(
        brightness: Brightness.light,
        background: AppColors.backgroundLight,
        foreground: AppColors.foregroundLight,
        surface: AppColors.surfaceLight,
        border: AppColors.borderLight,
        mutedForeground: AppColors.mutedForegroundLight,
        primary: AppColors.primary,
      );

  static ThemeData get dark => _buildTheme(
        brightness: Brightness.dark,
        background: AppColors.backgroundDark,
        foreground: AppColors.foregroundDark,
        surface: AppColors.surfaceDark,
        border: AppColors.borderDark,
        mutedForeground: AppColors.mutedForegroundDark,
        primary: AppColors.primaryDark,
      );

  static ThemeData _buildTheme({
    required Brightness brightness,
    required Color background,
    required Color foreground,
    required Color surface,
    required Color border,
    required Color mutedForeground,
    required Color primary,
  }) {
    final baseTextTheme = GoogleFonts.interTextTheme(
      brightness == Brightness.dark ? ThemeData.dark().textTheme : ThemeData.light().textTheme,
    );

    final displayFont = GoogleFonts.lexend();

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: primary,
        onPrimary: Colors.white,
        secondary: AppColors.accentInfo,
        onSecondary: Colors.white,
        error: AppColors.destructive,
        onError: Colors.white,
        surface: surface,
        onSurface: foreground,
      ),
      textTheme: baseTextTheme.copyWith(
        headlineLarge: displayFont.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w600,
          color: foreground,
          letterSpacing: -0.5,
        ),
        headlineMedium: displayFont.copyWith(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: foreground,
        ),
        titleMedium: displayFont.copyWith(fontWeight: FontWeight.w600, color: foreground),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(color: foreground),
        bodySmall: baseTextTheme.bodySmall?.copyWith(color: mutedForeground),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: foreground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: border),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: foreground,
          side: BorderSide(color: border),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: false,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: primary, width: 1.5),
        ),
      ),
      dividerColor: border,
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface,
        indicatorColor: primary.withOpacity(0.15),
        labelTextStyle: WidgetStateProperty.all(
          baseTextTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
}
