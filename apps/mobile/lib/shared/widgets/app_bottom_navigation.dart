import 'package:flutter/material.dart';

class AppBottomNavigationItem {
  const AppBottomNavigationItem({required this.icon, required this.selectedIcon, required this.label});

  final IconData icon;
  final IconData selectedIcon;
  final String label;
}

class AppBottomNavigation extends StatelessWidget {
  const AppBottomNavigation({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onDestinationSelected,
  });

  final List<AppBottomNavigationItem> items;
  final int currentIndex;

  /// Chamado sempre que se toca num separador — mesmo o que já está
  /// selecionado. `DashboardScaffold` usa isto para saber quando um
  /// separador voltou a ficar visível e as suas contagens (pedidos
  /// ativos, orçamentos, etc.) precisam de ser recarregadas — o
  /// `IndexedStack` mantém todos os separadores vivos, por isso o
  /// `initState()` de cada um só corre uma vez, nunca mais.
  final ValueChanged<int> onDestinationSelected;

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onDestinationSelected,
      destinations: [
        for (final item in items)
          NavigationDestination(icon: Icon(item.icon), selectedIcon: Icon(item.selectedIcon), label: item.label),
      ],
    );
  }
}
