import { Route, Routes } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import AdminLayout from './AdminLayout.jsx';
import DashboardPage from './DashboardPage.jsx';
import ImportPage from './ImportPage.jsx';
import ModerationPage from './ModerationPage.jsx';
import UsersPage from './UsersPage.jsx';
import AuditPage from './AuditPage.jsx';
import { CategoriesAdmin, LabsAdmin, LocationsAdmin, PricesAdmin, TestsAdmin } from './resources.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

/** The admin panel. The router only mounts it for admins (RequireAdmin), and every API call is also checked on the server. */
export default function AdminApp() {
  const { t } = useLang();
  usePageMeta({ title: t('admin.title') });

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="labs" element={<LabsAdmin />} />
        <Route path="tests" element={<TestsAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="locations" element={<LocationsAdmin />} />
        <Route path="prices" element={<PricesAdmin />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="price-reports" element={<ModerationPage key="price-reports" kind="price-reports" />} />
        <Route path="reviews" element={<ModerationPage key="reviews" kind="reviews" />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
