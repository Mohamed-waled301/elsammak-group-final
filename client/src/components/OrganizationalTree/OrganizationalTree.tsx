import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OrgNode } from './types';
import { TreeLevel } from './TreeNode';
import './OrganizationalTree.css';

const orgData: OrgNode[] = [
  {
    id: 'board',
    title: { ar: 'مجلس الإدارة', en: 'Board of Directors' },
    children: [
      {
        id: 'chairman',
        title: { ar: 'رئيس مجلس الإدارة', en: 'Chairman of the Board' },
        name: { ar: 'وليد محمد السماك', en: 'Walid Mohamed El-Sammak' },
        bioName: { ar: 'وليد محمد أحمد السماك', en: 'Walid Mohamed Ahmed El-Sammak' },
        bio: {
          ar: 'وليد محمد أحمد السماك\n\nخبير في الإدارة المالية والإدارية، بخبرة مهنية تمتد لأكثر من 15 عامًا داخل المؤسسات التعليمية، الصحية، والشركات، مع مسيرة مهنية متكاملة تجمع بين العمل التنفيذي، الإشرافي، والمجتمعي.\n\nيمتلك خبرة احترافية متقدمة في الإدارة المالية والمحاسبية، شئون العاملين والموارد البشرية، نظم المعلومات، الإحصاء المؤسسي، والإدارة التشغيلية، إلى جانب قدرته على التطوير المؤسسي وتحسين بيئة العمل ورفع كفاءة الأداء.\n\nشارك بفاعلية في العمل العام والسياسي والحزبي، وأسهم في تنظيم والمشاركة في مؤتمرات قومية وتنموية، ويؤمن بأن الالتزام، النزاهة، والانضباط المؤسسي هي الأساس الحقيقي لبناء الثقة وتحقيق النجاح المستدام.',
          en: 'Walid Mohamed Ahmed El-Sammak is an expert in financial and administrative management with more than 15 years of professional experience across educational, healthcare, and corporate institutions, combining executive, supervisory, and community engagement.\n\nHe brings advanced expertise in financial and accounting management, HR and personnel affairs, information systems, institutional statistics, and operational management, alongside organizational development and performance improvement.\n\nHe has actively contributed to public, political, and party work and believes that commitment, integrity, and institutional discipline are the foundation of trust and sustainable success.',
        },
      },
      {
        id: 'vice-chairman',
        title: { ar: 'نائب رئيس مجلس الإدارة', en: 'Vice Chairman of the Board' },
      },
      {
        id: 'board-members',
        title: { ar: 'أعضاء مجلس الإدارة', en: 'Board Members' },
      },
    ],
  },
  {
    id: 'exec',
    title: { ar: 'المدير التنفيذي وأمين الصندوق', en: 'Executive Director & Treasurer' },
    name: { ar: 'وائل محمد السماك', en: 'Wael Mohamed El-Sammak' },
    bioName: { ar: 'أ/ وائل محمد أحمد محمد (وائل لاشين)', en: 'Wael Mohamed Ahmed (Wael Lasheen)' },
    bio: {
      ar: 'أ/ وائل محمد أحمد محمد (وائل لاشين)\n\nالمدير الادارى لمجموعة السماك للاستشارات القانونية والمحاسبية، خبرة تمتد لأكثر من خمسة عشر عامًا في مجالات التدريب والإدارة والإرشاد النفسي والاجتماعي. حاصل على ليسانس الآداب – قسم الدراسات المسرحية، وتمهيدي ماجستير في علم النفس، إلى جانب مجموعة من الدبلومات المتخصصة في علم النفس والخدمة الاجتماعية والإدارة التربوية.\n\nيجمع بين الخبرة الميدانية والجانب العلمي، مما أتاح له تقديم رؤية مهنية متكاملة في مجالات التحليل السلوكي وتنمية المهارات الإدارية وإدارة الموارد البشرية وحل النزاعات المؤسسية. ويعتمد في عمله على مبادئ الدقة والموضوعية والشفافية، بهدف دعم الأفراد والمؤسسات وتعزيز الاستقرار القانوني والتنظيمي والنفسي.',
      en: 'Executive Director of El-Sammak Group for legal and accounting consultancy, with more than fifteen years of experience in training, administration, and psycho-social guidance. He holds a Bachelor of Arts in Theatre Studies and postgraduate psychology studies, with diplomas in psychology, social work, and educational administration.\n\nHe combines field experience with academic insight to deliver integrated professional support in behavioral analysis, administrative skills, HR, and institutional conflict resolution, guided by accuracy, objectivity, and transparency.',
    },
  },
  {
    id: 'admin',
    title: { ar: 'المدير الإداري / الممثل القانوني', en: 'Administrative Director / Legal Representative' },
    name: { ar: 'محمد أحمد الكسار', en: 'Mohamed Ahmed El-Kassar' },
    bioName: { ar: 'محمد أحمد محمد الكسار', en: 'Mohamed Ahmed Mohamed El-Kassar' },
    bio: {
      ar: 'محمد أحمد محمد الكسار\nالمستشار القانوني للمجموعة والمدير التنفيذي\n\nمحامٍ ومستشار قانوني بالاستئناف العالي ومجلس الدولة، حاصل على ليسانس الحقوق بنظام التعليم الدولي، يتميز بخبرة مهنية تجمع بين الدراية العميقة بالنصوص القانونية والقدرة على تطبيقها بذكاء ومرونة داخل بيئة العمل الواقعية.\n\nعرف عنه الجدية والالتزام في إدارة الملفات القانونية، مع قدرة عالية على التحليل وصياغة المذكرات والدفاع أمام المحاكم بمختلف درجاتها، مع احترام كامل لأخلاقيات وأصول المهنة.\n\nيسعى دائمًا إلى تقديم حلول قانونية مبتكرة تخدم مصلحة الموكلين، وتحقيق أعلى درجات التميز في مهنة المحاماة والاستشارات القانونية.',
      en: 'Group legal consultant and executive director. Lawyer and legal counsel before the Court of Appeal and the State Council, holding a Bachelor of Laws through the international education system, with expertise combining deep legal knowledge and practical application.\n\nHe is known for seriousness and commitment in managing legal files, strong analytical skills, professional drafting, and courtroom defense across judicial levels, with full respect for legal ethics.\n\nHe consistently aims to deliver innovative legal solutions for clients and excellence in legal practice.',
    },
  },
];

export default function OrganizationalTree() {
  const { t, i18n } = useTranslation();
  const [treeData] = useState<OrgNode[]>(orgData);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';

  return (
    <section className="org-tree-section" dir={dir}>
      <div className="org-tree-shell">
        <header className="org-tree-header">
          <h2>{t('organization.title')}</h2>
          <p>{t('organization.subtitle')}</p>
        </header>

        <div className="org-tree-content">
          <TreeLevel
            nodes={treeData}
            depth={0}
            boardExpanded={isBoardOpen}
            onBoardToggle={() => setIsBoardOpen((prev) => !prev)}
          />
        </div>
      </div>
    </section>
  );
}
