import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouterProvider, useRouter } from "@/lib/router";
import Home from "@/pages/Home";
import Result from "@/pages/Result";

function ViewSwitch() {
  const { view } = useRouter();
  if (view.name === "result") {
    return (
      <Result
        catKey={view.catKey}
        weights={view.weights}
        budget={view.budget}
        presetName={view.presetName}
        disabledDims={view.disabledDims}
      />
    );
  }
  return <Home />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterProvider>
          <ViewSwitch />
        </RouterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
