import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./layouts/Layout"
import PredictionPage from "./pages/MainPage"
const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/" element={<Layout><PredictionPage /></Layout>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default AppRoutes