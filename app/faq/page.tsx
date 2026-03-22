import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FAQPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-muted-foreground">
          Find answers to common questions about vegan cooking, ingredients, and our website.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>I'm not vegan. Will I enjoy these recipes?</AccordionTrigger>
            <AccordionContent>
              Our recipes are specifically designed to appeal to both vegans and non-vegans. We focus on creating dishes
              that are satisfying, flavorful, and don't leave you feeling like you're missing out on anything. Many of
              our team members and recipe testers are non-vegans who love these dishes.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Where can I find vegan ingredients?</AccordionTrigger>
            <AccordionContent>
              Most of our recipes use ingredients that can be found in regular supermarkets. For more specialized items
              like nutritional yeast or certain plant-based proteins, check the health food section of your grocery
              store, natural food stores, or online retailers. We try to suggest common alternatives when a recipe calls
              for something that might be harder to find.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Are vegan recipes nutritionally complete?</AccordionTrigger>
            <AccordionContent>
              We strive to create nutritionally balanced recipes, but individual nutritional needs vary. Our recipes
              often include good sources of plant-based proteins, healthy fats, and complex carbohydrates. For specific
              nutrients like B12, vitamin D, and omega-3 fatty acids that can be harder to get from plant foods, we
              recommend consulting with a healthcare provider about supplements or specifically fortified foods.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How do I replace eggs in baking?</AccordionTrigger>
            <AccordionContent>
              There are several effective egg replacers for baking, depending on the recipe:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Flax or chia eggs (1 tbsp ground seeds + 3 tbsp water)</li>
                <li>Mashed banana (1/4 cup per egg)</li>
                <li>Applesauce (1/4 cup per egg)</li>
                <li>Aquafaba (3 tbsp per egg)</li>
                <li>Commercial egg replacers</li>
              </ul>
              Different replacers work better for different recipes, and we specify which ones work best in each of our
              baking recipes.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>How do I make vegan food taste satisfying?</AccordionTrigger>
            <AccordionContent>
              The key to satisfying vegan food is understanding how to build flavor and create appealing textures:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use umami-rich ingredients like mushrooms, tomato paste, miso, and nutritional yeast</li>
                <li>Don't skimp on herbs and spices</li>
                <li>
                  Layer flavors by using different cooking techniques (roasting, caramelizing, etc.) for different
                  components
                </li>
                <li>Pay attention to texture contrasts (creamy, crunchy, chewy)</li>
                <li>Don't forget the importance of fat for flavor and satisfaction</li>
              </ul>
              Our recipes incorporate these principles to create dishes that are truly satisfying.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Are your recipes allergen-friendly?</AccordionTrigger>
            <AccordionContent>
              While all our recipes are free from animal products, we do use a variety of plant-based ingredients that
              may include common allergens like nuts, soy, wheat, and gluten. We try to note potential allergens in our
              recipes and often suggest alternatives when possible. If you have specific dietary restrictions, please
              read ingredient lists carefully and adapt as needed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>How can I contribute a recipe?</AccordionTrigger>
            <AccordionContent>
              We love featuring community recipes! If you have a vegan recipe that's been a hit with the non-vegans in
              your life, please submit it through our "Submit a Recipe" form on your profile page. Our team will review
              it, and if selected, we'll feature it on our site with credit to you.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>Do I need special equipment for vegan cooking?</AccordionTrigger>
            <AccordionContent>
              Most of our recipes can be made with standard kitchen equipment. A good blender or food processor is
              helpful for many vegan recipes (for sauces, dips, etc.), but it's not essential for everything. When a
              recipe requires specialized equipment, we'll note that clearly and try to offer alternatives when
              possible.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9">
            <AccordionTrigger>Are vegan recipes more expensive to make?</AccordionTrigger>
            <AccordionContent>
              Not necessarily! While some specialty vegan products can be pricey, many plant-based staples like beans,
              rice, pasta, and seasonal vegetables are among the most affordable foods available. We focus on
              cost-effective recipes and note when a recipe uses more specialty ingredients. Overall, a plant-based diet
              can be very economical, especially when focusing on whole foods rather than processed alternatives.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10">
            <AccordionTrigger>How can I contact you with other questions?</AccordionTrigger>
            <AccordionContent>
              If you have a question that's not answered here, please visit our Contact page to send us a message. We do
              our best to respond to all inquiries within 2-3 business days.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            We're here to help! Reach out to us directly and we'll get back to you as soon as possible.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
