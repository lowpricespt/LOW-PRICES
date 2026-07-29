import 'package:flutter/material.dart';

/// Ícone por `slug` de categoria — os dados reais (id UUID, nome, slug)
/// vêm sempre de `GET /categories` via `categoriesProvider`; isto serve
/// só de mapeamento visual, nunca de fonte de verdade sobre que
/// categorias existem (essa era a causa do bug: o `id` usado para
/// submeter pedidos era um slug local em vez do UUID real da BD).
const Map<String, IconData> kCategoryIconsBySlug = {
  'canalizador': Icons.plumbing_outlined,
  'eletricista': Icons.bolt_outlined,
  'pintor': Icons.format_paint_outlined,
  'jardinagem': Icons.park_outlined,
  'limpeza': Icons.auto_awesome_outlined,
  'mudancas': Icons.local_shipping_outlined,
  'montagem-moveis': Icons.handyman_outlined,
  'informatica': Icons.laptop_mac_outlined,
};

IconData iconForCategorySlug(String slug) => kCategoryIconsBySlug[slug] ?? Icons.build_outlined;
