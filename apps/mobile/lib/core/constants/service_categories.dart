import 'package:flutter/material.dart';

class ServiceCategory {
  const ServiceCategory({required this.id, required this.name, required this.icon});

  final String id;
  final String name;
  final IconData icon;
}

const List<ServiceCategory> kServiceCategories = [
  ServiceCategory(id: 'canalizador', name: 'Canalizador', icon: Icons.plumbing_outlined),
  ServiceCategory(id: 'eletricista', name: 'Eletricista', icon: Icons.bolt_outlined),
  ServiceCategory(id: 'pintor', name: 'Pintor', icon: Icons.format_paint_outlined),
  ServiceCategory(id: 'jardinagem', name: 'Jardinagem', icon: Icons.park_outlined),
  ServiceCategory(id: 'limpeza', name: 'Limpeza', icon: Icons.auto_awesome_outlined),
  ServiceCategory(id: 'mudancas', name: 'Mudanças', icon: Icons.local_shipping_outlined),
  ServiceCategory(id: 'montagem-moveis', name: 'Montagem de móveis', icon: Icons.handyman_outlined),
  ServiceCategory(id: 'informatica', name: 'Informática', icon: Icons.laptop_mac_outlined),
];
