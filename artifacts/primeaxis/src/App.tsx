import { Switch, Route, Router as WouterRouter } from "wouter";
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
  return (
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
      <Route component={NotFound} />
    </Switch>
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
