import { Refine } from "@refinedev/core";
import { 
    AppstoreOutlined,       // Ikon Kotak-kotak (Projects)
    UserOutlined,           // Ikon Orang (Profile)
    ReadOutlined,           // Ikon Buku (Education)
    RocketOutlined,         // Ikon Roket (Experience)
    SafetyCertificateOutlined, // Ikon Sertifikat (Certificates)
    ContactsOutlined,       // Ikon Buku Telepon (Contacts)
    BuildOutlined,          // Ikon Palu/Peralatan (Skills)
    MessageOutlined         // Ikon Pesan (Messages)
} from "@ant-design/icons";
import { 
    ThemedLayout,
    ThemedSider,
    ErrorComponent,
    useNotificationProvider,
    AuthPage,
} from "@refinedev/antd";

import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import routerBindings, { NavigateToResource } from "@refinedev/react-router";

import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";

import "@refinedev/antd/dist/reset.css";
import axios from "axios";

import { ProjectList } from "./pages/projects/list";
import { ProjectCreate } from "./pages/projects/create";
import { ProjectEdit } from "./pages/projects/edit";
import { ProfileEdit } from "./pages/profile/edit";
import { EducationList } from "./pages/educations/list";
import { EducationCreate } from "./pages/educations/create";
import { EducationEdit } from "./pages/educations/edit";
import { ExperienceList } from "./pages/experiences/list";
import { ExperienceCreate } from "./pages/experiences/create";
import { ExperienceEdit } from "./pages/experiences/edit";
import { CertificateList } from "./pages/certificates/list";
import { CertificateCreate } from "./pages/certificates/create";
import { CertificateEdit } from "./pages/certificates/edit";
import { ContactList } from "./pages/contacts/list";
import { ContactCreate } from "./pages/contacts/create";
import { ContactEdit } from "./pages/contacts/edit";
import { SkillList } from "./pages/skills/list";
import { SkillCreate } from "./pages/skills/create";
import { SkillEdit } from "./pages/skills/edit";
import { authProvider } from "./authProvider";
import { Login } from "./pages/auth/login";

const API_URL = "http://localhost:8000";

// --- KONFIGURASI AXIOS GLOBAL ---
const axiosInstance = axios.create();

// Setiap kali mau request, cek apakah ada token?
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("my_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("my_access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <Refine
          authProvider={authProvider}
          dataProvider={dataProvider(API_URL, axiosInstance)}
          notificationProvider={useNotificationProvider}
          routerProvider={routerBindings}
          resources={[
              {
                  name: "projects",
                  list: "/projects",
                  create: "/projects/create",
                  edit: "/projects/edit/:id",
                  meta: { label: "Portofolio", icon: <AppstoreOutlined /> }
              },
              {
                name: "profile", // Nama menu
                list: "/profile", // Saat diklik, lari ke route /profile
                meta: { label: "My Profile", icon: <UserOutlined/>} // Label yang tampil di sidebar
              },
              { 
                name: "educations", 
                list: "/educations",
                create: "/educations/create",
                edit: "/educations/edit/:id",
                meta: { label: "Pendidikan", icon: <ReadOutlined /> }
              },
              {
                  name: "experiences",
                  list: "/experiences",
                  create: "/experiences/create",
                  edit: "/experiences/edit/:id",
                  meta: { label: "Pekerjaan", icon: <RocketOutlined /> }
              },
              {
                  name: "certificates",
                  list: "/certificates",
                  create: "/certificates/create",
                  edit: "/certificates/edit/:id",
                  meta: { label: "Sertifikasi", icon: <SafetyCertificateOutlined /> }
              },
              {
                  name: "contacts",
                  list: "/contacts",
                  create: "/contacts/create",
                  edit: "/contacts/edit/:id",
                  meta: { label: "Contact", icon: <ContactsOutlined /> }
              },
              {
                  name: "skills",
                  list: "/skills",
                  create: "/skills/create",
                  edit: "/skills/edit/:id",
                  meta: { label: "Keahlian (Skills)", icon: <BuildOutlined /> }
              },
          ]}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ThemedLayout 
                  Header={Header}
                  Sider={ThemedSider}
                >
                  <Outlet />
                </ThemedLayout>
              }
            >
              <Route
                index
                element={<NavigateToResource resource="projects" />}
              />

              <Route path="/projects">
                <Route index element={<ProjectList />} />
                <Route path="create" element={<ProjectCreate />} />
                <Route path="edit/:id" element={<ProjectEdit />} />
              </Route>

              <Route path="/profile" element={<ProfileEdit />} />

              <Route path="/educations">
                <Route index element={<EducationList />} />
                <Route path="create" element={<EducationCreate />} />
                <Route path="edit/:id" element={<EducationEdit />} />
              </Route>

              <Route path="/experiences">
                <Route index element={<ExperienceList />} />
                <Route path="create" element={<ExperienceCreate />} />
                <Route path="edit/:id" element={<ExperienceEdit />} />
              </Route>

              <Route path="/certificates">
                <Route index element={<CertificateList />} />
                <Route path="create" element={<CertificateCreate />} />
                <Route path="edit/:id" element={<CertificateEdit />} />
              </Route>

              <Route path="/contacts">
                <Route index element={<ContactList />} />
                <Route path="create" element={<ContactCreate />} />
                <Route path="edit/:id" element={<ContactEdit />} />
              </Route>

              <Route path="/skills">
                <Route index element={<SkillList />} />
                <Route path="create" element={<SkillCreate />} />
                <Route path="edit/:id" element={<SkillEdit />} />
              </Route>

              <Route path="*" element={<ErrorComponent />} />
            </Route>
          </Routes>
        </Refine>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
