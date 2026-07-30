import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';

class DashboardScaffold extends ConsumerStatefulWidget {
  const DashboardScaffold({super.key, required this.items, required this.pages, this.appBarTitle});

  final List<AppBottomNavigationItem> items;
  final List<Widget> pages;
  final String? appBarTitle;

  @override
  ConsumerState<DashboardScaffold> createState() => _DashboardScaffoldState();
}

class _DashboardScaffoldState extends ConsumerState<DashboardScaffold> {
  int _currentIndex = 0;

  void _selectTab(int index) {
    setState(() => _currentIndex = index);
    // Ver nota em `dashboardTabIndexProvider` — isto é o que permite aos
    // separadores "Início" saberem que voltaram a ficar visíveis.
    ref.read(dashboardTabIndexProvider.notifier).state = index;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: widget.pages),
      bottomNavigationBar: AppBottomNavigation(
        items: widget.items,
        currentIndex: _currentIndex,
        onDestinationSelected: _selectTab,
      ),
    );
  }
}
