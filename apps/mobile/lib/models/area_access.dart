class PricingQuote {
  const PricingQuote({required this.amount, required this.currency, required this.description});

  final int amount; // cêntimos
  final String currency;
  final String description;

  factory PricingQuote.fromJson(Map<String, dynamic> json) {
    return PricingQuote(
      amount: json['amount'] as int,
      currency: json['currency'] as String,
      description: json['description'] as String,
    );
  }
}

class AreaAccessPlans {
  const AreaAccessPlans({required this.monthly, required this.weekly});

  final PricingQuote monthly;
  final PricingQuote weekly;

  factory AreaAccessPlans.fromJson(Map<String, dynamic> json) {
    return AreaAccessPlans(
      monthly: PricingQuote.fromJson(json['monthly'] as Map<String, dynamic>),
      weekly: PricingQuote.fromJson(json['weekly'] as Map<String, dynamic>),
    );
  }
}

class AreaAccessStatus {
  const AreaAccessStatus({required this.isActive, required this.subscriptionTier, required this.areaAccessExpiresAt});

  final bool isActive;
  final String? subscriptionTier;
  final DateTime? areaAccessExpiresAt;

  factory AreaAccessStatus.fromJson(Map<String, dynamic> json) {
    return AreaAccessStatus(
      isActive: json['isActive'] as bool,
      subscriptionTier: json['subscriptionTier'] as String?,
      areaAccessExpiresAt:
          json['areaAccessExpiresAt'] == null ? null : DateTime.parse(json['areaAccessExpiresAt'] as String),
    );
  }
}
