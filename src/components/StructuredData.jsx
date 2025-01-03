import React from 'react';

const StructuredData = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Leadstor",
    "url": "https://www.leadstor.in",
    "description": "LeadStor is an advanced online lead management software designed to help businesses manage and track their leads efficiently.",
    "logo": "https://leadstor.in/icons/leadstor.png",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "WebApplication",
    "operatingSystem": "All",
    "softwareVersion": "1.0.3",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61565472072220",
      "https://www.linkedin.com/company/leadstor-in/",
      "https://x.com/leadstor",
      "https://www.youtube.com/@LeadStor",
      "https://www.instagram.com/leadstor.in"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-860-007-4862",
      "email": "hello@leadstor.in"
    },
    "offers": {
      "@type": "Offer",
      "price": "3500",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "150"
    },
    "featureList": [
      "Real-time lead tracking and management",
      "Customizable lead scoring system",
      "Automated email follow-ups",
      "Integration with popular CRM platforms",
      "Advanced reporting and analytics",
      "Mobile-friendly interface"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default StructuredData;