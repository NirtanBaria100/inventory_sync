import {
  Page,
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";
import Home from "./Home"
import '../assets/css/style.css';


export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <Home />
    </>
  );
}
