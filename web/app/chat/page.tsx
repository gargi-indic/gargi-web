import type { Metadata } from "next";
import { ChatClient } from "@/components/chat/ChatClient";
import { M1 } from "@/content/site";

export const metadata: Metadata = {
  title: "Chat",
  description: `Talk to ${M1.name}, a ${M1.params}-parameter Malayalam language model.`,
};

export default function ChatPage() {
  return <ChatClient />;
}
