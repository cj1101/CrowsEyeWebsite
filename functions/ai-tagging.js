const { onObjectFinalized } = require('firebase-functions/v2/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, getApps } = require('firebase-admin/app');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Firebase Admin SDK if not already done
if (getApps().length === 0) {
  initializeApp();
}

const firestore = getFirestore();

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: 'us-central1',
});

const model = 'gemini-1.5-flash-001'; // A powerful and cost-effective model for this task

const generativeModel = vertexAI.getGenerativeModel({
  model: model,
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 256,
    topP: 0.95,
    topK: 40,
  },
});

const PROMPT = `Analyze this media file and generate a list of 5 to 10 descriptive tags. 
The tags should be relevant keywords that describe the objects, concepts, and style of the content.
Do not include the '#' symbol in the tags.
Return the tags as a valid JSON array of strings. For example: ["tag1", "tag2", "tag3"]`;

exports.generateTagsOnUpload = onObjectFinalized({ cpu: 2, memory: '1GiB' }, async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;

  console.log(`[AI Tagging] New file detected: ${filePath} (${contentType})`);

  // 1. Check if the file is an image or video in the correct folder
  if (!contentType || (!contentType.startsWith('image/') && !contentType.startsWith('video/'))) {
    console.log('[AI Tagging] File is not an image or video. Skipping.');
    return null;
  }
  if (!filePath.startsWith('users/')) {
    console.log('[AI Tagging] File is not in a user directory. Skipping.');
    return null;
  }

  try {
    // 2. Find the corresponding document in Firestore
    console.log(`[AI Tagging] Searching for Firestore document with gcsPath: ${filePath}`);
    const mediaQuery = await firestore.collection('media')
      .where('gcsPath', '==', filePath)
      .limit(1)
      .get();

    if (mediaQuery.empty) {
      console.error(`[AI Tagging] No Firestore document found for path: ${filePath}`);
      return null;
    }

    const mediaDoc = mediaQuery.docs[0];
    console.log(`[AI Tagging] Found document with ID: ${mediaDoc.id}`);

    // 3. Prepare the request for the Generative AI model
    const filePart = {
      fileData: {
        mimeType: contentType,
        fileUri: `gs://${fileBucket}/${filePath}`,
      },
    };

    const request = {
      contents: [{ role: 'user', parts: [{ text: PROMPT }, filePart] }],
    };

    // 4. Call the AI model to generate tags
    console.log('[AI Tagging] Sending request to Gemini AI model...');
    const response = await generativeModel.generateContent(request);
    
    if (!response.response.candidates || response.response.candidates.length === 0) {
        throw new Error('AI model returned no candidates.');
    }

    const content = response.response.candidates[0].content;
    const jsonString = content.parts[0].text.replace(/```json|```/g, '').trim();
    const generatedTags = JSON.parse(jsonString);

    console.log('[AI Tagging] Received tags from AI:', generatedTags);

    // 5. Format tags and update the Firestore document
    const aiTagsForFirestore = generatedTags.map(tag => ({
      tag: tag.toLowerCase(),
      confidence: 0.95, // Using a default high confidence score
    }));

    await mediaDoc.ref.update({
      aiTags: aiTagsForFirestore,
      updatedAt: new Date(),
    });

    console.log(`[AI Tagging] Successfully updated document ${mediaDoc.id} with ${aiTagsForFirestore.length} tags.`);
    return true;

  } catch (error) {
    console.error('[AI Tagging] An error occurred:', error);
    return false;
  }
});
