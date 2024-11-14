import {
  Page,
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";
import Home from "./Home"

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Page >
      <Home />
    </Page>
  );
}
