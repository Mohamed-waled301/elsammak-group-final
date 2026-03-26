const express = require('express');
const router = express.Router();

const orgData = [
  {
    id: "board",
    title: { ar: "مجلس الإدارة", en: "Board of Directors" },
    children: [
      {
        id: "chairman",
        title: { ar: "رئيس مجلس الإدارة", en: "Chairman of the Board" },
        name: { ar: "وليد محمد السماك", en: "Walid Mohamed El-Sammak" },
        bioName: { ar: "وليد محمد أحمد السماك", en: "Walid Mohamed Ahmed El-Sammak" },
        bio: {
          ar: "وليد محمد أحمد السماك\n\nخبير في الإدارة المالية والإدارية، بخبرة مهنية تمتد لأكثر من 15 عامًا داخل المؤسسات التعليمية، الصحية، والشركات، مع مسيرة مهنية متكاملة تجمع بين العمل التنفيذي، الإشرافي، والمجتمعي.\n\nيمتلك خبرة احترافية متقدمة في الإدارة المالية والمحاسبية، شئون العاملين والموارد البشرية، نظم المعلومات، الإحصاء المؤسسي، والإدارة التشغيلية، إلى جانب قدرته على التطوير المؤسسي وتحسين بيئة العمل ورفع كفاءة الأداء.\n\nشارك بفاعلية في العمل العام والسياسي والحزبي، وأسهم في تنظيم والمشاركة في مؤتمرات قومية وتنموية، ويؤمن بأن الالتزام، النزاهة، والانضباط المؤسسي هي الأساس الحقيقي لبناء الثقة وتحقيق النجاح المستدام.",
          en: null
        }
      },
      {
        id: "vice-chairman",
        title: { ar: "نائب رئيس مجلس الإدارة", en: "Vice Chairman of the Board" }
      },
      {
        id: "board-members",
        title: { ar: "أعضاء مجلس الإدارة", en: "Board Members" }
      }
    ]
  }
];

// Mock API route, intentionally not requiring database connection
router.get('/', (req, res) => {
  res.json({ success: true, data: orgData });
});

module.exports = router;
