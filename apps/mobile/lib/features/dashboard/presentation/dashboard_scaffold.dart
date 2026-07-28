import 'package:flutter/material.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';

class DashboardScaffold extends StatefulWidget {
  const DashboardScaffold({super.key, required this.items, required this.pages, this.appBarTitle});

  final List<AppBottomNavigationItem> items;
  final List<Widget> pages;
  final String? appBarTitle;

  @override
  State<DashboardScaffold> createState() => _DashboardScaffoldState();
}

class _DashboardScaffoldState extends State<DashboardScaffold> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: widget.pages),
      bottomNavigationBar: AppBottomNavigation(
        items: widget.items,
        currentIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
