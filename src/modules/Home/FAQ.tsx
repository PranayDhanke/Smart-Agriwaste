"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle } from "lucide-react"

export default function FAQ() {
  const faqData = [
    {
      id: "item-1",
      question: "What is agricultural waste?",
      answer: "Agricultural waste includes crop residues, fruit & vegetable waste, animal manure, and agro-industry by-products that remain after farming or processing activities. These materials, when properly managed, can become valuable resources for sustainable farming practices.",
    },
    {
      id: "item-2",
      question: "How does the marketplace work?",
      answer: "Farmers can list their agricultural waste on our platform with details like type, quantity, and price. Buyers can browse listings, contact farmers directly, and make purchases. We facilitate secure transactions and provide analytics for both parties.",
    },
    {
      id: "item-3",
      question: "Why should we avoid burning crop residues?",
      answer: "Burning releases harmful greenhouse gases, reduces soil fertility, and contributes to air pollution. Instead, residues can be used for compost, biogas, animal feed, or sold through our marketplace to generate income.",
    },
    {
      id: "item-4",
      question: "How can agricultural waste be used for energy?",
      answer: "Agricultural waste like manure and crop residues can be converted into biogas or biomass energy, providing a renewable and sustainable source of power. Many buyers on our platform purchase waste specifically for energy production.",
    },
    {
      id: "item-5",
      question: "What types of waste can I list or buy?",
      answer: "You can list or purchase various types including crop residues (wheat straw, rice husk), fruit & vegetable waste, animal manure, coconut shells, sugarcane bagasse, and other organic agricultural by-products.",
    },
    {
      id: "item-6",
      question: "Is there a fee to use the platform?",
      answer: "Creating an account and browsing the marketplace is completely free. We only charge a small commission on successful transactions to maintain and improve our platform.",
    },
    {
      id: "item-7",
      question: "How do I ensure quality of the waste I'm buying?",
      answer: "All farmers are verified on our platform. You can view ratings, reviews, and detailed descriptions of each listing. We recommend communicating directly with sellers and, if possible, inspecting the waste before finalizing large purchases.",
    },
    {
      id: "item-8",
      question: "Can I get guidance on waste management processes?",
      answer: "Yes! Visit our 'Waste Management Processes' section to learn about composting, biogas production, vermicomposting, and other methods. We provide step-by-step guides for different waste types.",
    },
  ]

  return (
    <div className="bg-white py-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our agricultural waste marketplace
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border rounded-lg px-6 bg-white shadow-sm hover:shadow-md transition"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-green-600 py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-green-50 rounded-2xl p-8 border border-green-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you with any queries about the platform or waste management.
          </p>
          <Link href="/community">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
              Visit Community Forum
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
