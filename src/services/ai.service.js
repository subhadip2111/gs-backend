const OpenAI = require("openai");
const config = require("../config/config");
const { Category, SubCategory } = require("../models");

// Groq is OpenAI-compatible
const openai = new OpenAI({
  apiKey: config.groq.apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Suggest related categories and subcategories for a product using Groq (Llama 3)
 * @param {Object} product
 * @returns {Promise<{categories: string[], subcategories: string[]}>}
 */
const suggestRelatedCategories = async (product) => {
    // Fetch all category and subcategory names to give context to the AI
    const [categories, subCategories] = await Promise.all([
        Category.find({}).select('name'),
        SubCategory.find({}).select('name')
    ]);

    const prompt = `
    You are a product upselling expert. 
    Current Product:
    - Name: ${product.name}
    - Description: ${product.description}
    - Category: ${product.category?.name || 'N/A'}
    - SubCategory: ${product.subcategory?.name || 'N/A'}
    - Price: ${product.variants[0]?.sizes[0]?.price || 'N/A'}

    Available Categories: ${categories.map(c => c.name).join(', ')}
    Available SubCategories: ${subCategories.map(s => s.name).join(', ')}

    Based on the current product, identify 3 other category names AND 3 other subcategory names that are different from the current ones but represent an UPGRADE or a PREMIUM addition to what the user is currently viewing.
    Focus on categories that a customer would consider if they are looking for a higher-end experience or more advanced features relative to ${product.name}.
    Return ONLY a JSON object with this structure: 
    {
      "categories": ["cat1", "cat2", "cat3"],
      "subcategories": ["sub1", "sub2", "sub3"]
    }
    `;

    const response = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
            { role: "system", content: "You are a helpful assistant that returns only JSON." },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
};

module.exports = {
    suggestRelatedCategories,
};
