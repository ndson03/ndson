import { useTranslation } from "react-i18next";

export default function WelcomeMessage() {
  const { t } = useTranslation();

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -mt-32 z-0">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light text-foreground">
          {t("hello")}
        </h1>
        <p className="text-xl md:text-3xl text-muted-foreground mt-6 font-light">
          {t("welcome.title")}
        </p>
      </div>
    </div>
  );
}
