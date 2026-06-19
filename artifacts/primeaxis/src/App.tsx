import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { Toaster as SonnerToaster } from "sonner";
import HomePage from "@/pages/home";
import ArticlePage from "@/pages/article";
import CategoryPage from "@/pages/category";
import ReviewsPage from "@/pages/reviews";
import ReviewPage from "@/pages/review";
import VideosPage from "@/pages/videos";
import AuthorPage from "@/pages/author";
import SearchPage from "@/pages/search";
import NewslettersPage from "@/pages/newsletters";
import UnsubscribePage from "@/pages/unsubscribe";
import { AboutPage, ContactPage, PrivacyPage, TermsPage, AffiliateDisclosurePage, AdvertisePage } from "@/pages/static-pages";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});

function Routes() {
  const [loc] = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loc}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.32, ease: [0.22, 0.65, 0.32, 1] }}
      >
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/article/:slug" component={ArticlePage} />
          <Route path="/category/:slug" component={CategoryPage} />
          <Route path="/reviews" component={ReviewsPage} />
          <Route path="/review/:slug" component={ReviewPage} />
          <Route path="/videos" component={VideosPage} />
          <Route path="/author/:slug" component={AuthorPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/newsletters" component={NewslettersPage} />
          <Route path="/unsubscribe" component={UnsubscribePage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/affiliate-disclosure" component={AffiliateDisclosurePage} />
          <Route path="/advertise" component={AdvertisePage} />
          <Route path="/ethics" component={AboutPage} />
          <Route path="/careers" component={ContactPage} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Layout>
              <Routes />
            </Layout>
          </WouterRouter>
          <SonnerToaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              className:
                "border hairline bg-card text-card-foreground shadow-xl",
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
