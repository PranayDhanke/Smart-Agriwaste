import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function Community() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Intro Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-700">Community</h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Connect with farmers, experts, and innovators who are passionate
            about sustainable agriculture waste management. Share ideas, ask
            questions, and collaborate!
          </p>
          <Link href={"/community/chats"}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Join the Discussion
            </Button>
          </Link>
        </section>

        {/* Community Benefits */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-green-700 text-center">
            Why Join Our Community?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Meet other farmers, researchers, and eco-entrepreneurs who
                  share your goals.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Share</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Post your challenges, success stories, and ask questions to
                  learn together.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Discover innovative waste management practices and earn from
                  your knowledge.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
