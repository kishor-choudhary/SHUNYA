import NotFoundView from "@/components/NotFoundView";

/**
 * Root fallback for URLs that match no route at all. It renders outside the
 * public chrome, so it brings its own <main> landmark.
 */
export default function RootNotFound() {
  return <NotFoundView standalone />;
}
