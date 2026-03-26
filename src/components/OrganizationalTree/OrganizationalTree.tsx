import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { OrgNode } from './types';
import { TreeLevel } from './TreeNode';
import './OrganizationalTree.css';

interface OrgApiResponse {
  success: boolean;
  data: OrgNode[];
}

export default function OrganizationalTree() {
  const [treeData, setTreeData] = useState<OrgNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await fetch('/api/org-structure');
        if (!response.ok) {
          throw new Error('تعذر تحميل الهيكل التنظيمي');
        }

        const payload: OrgApiResponse = await response.json();
        if (!payload.success || !Array.isArray(payload.data)) {
          throw new Error('تنسيق بيانات الهيكل غير صالح');
        }

        setTreeData(payload.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
  }, []);

  return (
    <section className="org-tree-section" dir="rtl">
      <div className="org-tree-shell">
        <header className="org-tree-header">
          <h2>الهيكل التنظيمي</h2>
          <p>
            شجرة تنظيمية تفاعلية تعكس الهيكل المؤسسي لمجموعة السماك بصورة احترافية قابلة للتوسع.
          </p>
        </header>

        <div className="org-tree-content">
          {isLoading && (
            <div className="org-tree-state">
              <Loader2 size={26} className="org-tree-spin" />
              <span>جاري تحميل البيانات...</span>
            </div>
          )}

          {!isLoading && error && <div className="org-tree-state org-tree-error">{error}</div>}

          {!isLoading && !error && (
            <TreeLevel nodes={treeData} depth={0} />
          )}
        </div>
      </div>
    </section>
  );
}
