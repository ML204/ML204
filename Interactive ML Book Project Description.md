# Interactive ML Book: Project Description

Prepared for Hamim · November 22, 2026 · Draft v1

## 1. Overview

The Interactive ML Book is a free, book-style learning website that teaches machine learning through **editable figures**. Instead of only reading about a concept, the student changes a value, drags a point or moves a slider and watches the figure respond. Every topic is explained in simple language and in depth, so that a student can understand it, explain it to a friend and teach it to others.

The platform is for students from high school to undergraduate level. It launches in English, with Bangla support planned for a later phase. It follows the structure of the ML learning checklist, without the IoT/TinyML section and without programming: the platform teaches theory only.

## 2. Vision and Goals

**Vision:** a learning platform where any student, with no prior background, can finish a chapter feeling that they truly understood it.

**Main goal: student satisfaction.** Every design decision is judged by one question: does this make the student feel clearer, more confident and more motivated?

Supporting goals:

- Make machine learning visual and hands-on, not abstract.
- Keep the language simple without making the content shallow.
- Help students reach the point where they can teach the idea to others.
- Make the platform accessible and affordable for students in Bangladesh: free, light on data and mobile friendly.
- Test understanding with quizzes that explain every answer afterwards.

## 3. Target Audience

- High school students curious about ML and AI.
- Undergraduate students taking ML, data science or AI courses.
- Self-learners and early-career developers who find textbooks too dense.
- Teachers and peer tutors who want a visual tool to demonstrate ideas in class.

There is a single version of the content. It is written to be understandable for everyone, so there is no separate School/Undergrad level.

## 4. Guiding Principles

1. **Simple but deep.** Start from a real-life picture, use plain words, then build up to the full idea. Short sentences, one idea per paragraph, and no skipped steps.
2. **Figure first.** The editable figure is the main teacher. The text supports it, and tappable phrases in the text can change the figure.
3. **Learn by doing.** Predict, experiment, reveal, then challenge.
4. **Learn to teach.** Each sub-chapter ends with a chance to explain the idea in the student's own words.
5. **Respect the student's time and device.** Short sub-chapters, fast pages, low data use.
6. **Clear language, English first,** with the structure ready for Bangla to be added later.

## 5. Content Structure

The book is organized as Part → Chapter → Sub-chapter. The parts follow the learning checklist, with the IoT/TinyML part removed.

| Part | Examples of chapters |
| --- | --- |
| 1. Math Foundations | Vectors and matrices, derivatives and gradient descent, probability, statistics, optimization, entropy |
| 2. Data Handling | Exploring data, cleaning, scaling and encoding, splitting data, data leakage, class imbalance |
| 3. Classical Machine Learning | Linear and logistic regression, k-NN, decision trees, SVM, ensembles, clustering, PCA, anomaly detection, model quality and metrics |
| 4. Deep Learning | Neurons and networks, backpropagation, training techniques, CNNs, sequence models, attention and transformers, autoencoders, GANs |
| 5. Specialized Areas | Time series, computer vision, NLP, large language models, generative models, reinforcement learning |
| 6. MLOps and Deployment | Experiment tracking, serving a model, monitoring, data drift |
|  |  |

Following the checklist, the book can be read in order, while math topics are introduced when a model needs them.

## 6. Sub-chapter Template

Each chapter is divided into sub-chapters of about 5 to 10 minutes. Each sub-chapter has the same shape, so students always know what to expect:

1. **What is it:** a short, plain definition of the topic.
2. **Why we need it:** the problem it solves and where it is used.
3. **Explained in detail:** the full idea in simple language, step by step, with an analogy or example.
4. **Figure:** the editable figure, with sliders, draggable points and presets.
5. **Figure explanation:** what the figure shows, what to try, and what each change means.
6. **Notes:** the formula, with each symbol explained, and other important points and common mistakes.
7. **Quiz:** a short quiz to test understanding.
8. **Quiz explanation:** answers and full explanations, shown after the quiz is finished.
9. **Like or suggest something:** a like button and a box where readers can send suggestions or corrections.

Each sub-chapter includes its own quiz. Possible extras, to be decided: an explain-it-in-your-own-words box and a Teach this summary card.

## 7. Interactive Figures

Figures are the heart of the platform. Controls include:

- Sliders for parameters such as learning rate, k, polynomial degree and threshold.
- Draggable and clickable points to add, move or remove data.
- Editable tables, for example matrix values that update a plot.
- Dropdowns and toggles, such as activation function or kernel.
- Play, pause and step buttons for algorithms that run over time.
- A canvas for drawing digits or shapes.
- Presets (for example underfit, good fit, overfit), a Reset button and a "Break it" button that shows what happens at extreme values.

Each figure also shows a live values panel (loss, accuracy, weights) and uses the same colors and labels throughout the book. The state of a figure is stored in the page link, so a student or teacher can share an exact setup.

Examples: gradient descent as a ball rolling down a curve, a regression line that refits as points are dragged, a threshold slider that updates the confusion matrix, ROC and PR curves together, a neural network playground, a CNN filter sliding over a drawn digit, and an attention heatmap for a typed sentence.

## 8. Quizzes

- A quiz in every sub-chapter after learning, built from multiple choice, numeric, interactive figure tasks, "spot the mistake" and "which explanation is correct" questions.
- Questions are ordered from basic to challenge.
- **Explanations appear after the student finishes the quiz.** The results page shows the score and, for each question, the student's answer, the correct answer, a full explanation, a **See it in the figure** button and a link back to the lesson.
- A weak-topic summary and a retake option with shuffled questions or new numbers.
- Progress is saved locally in the browser. No account is needed to start.

## 9. Languages (Bangla Planned for Later)

- Version 1 is English only. Bangla is added later, with text, quizzes and interface labels switched from the header. To make this easy, all interface text is kept in separate language files from the start.
- A shared glossary with consistent Bangla terms, showing the English term in brackets or in a hover tip.
- Correct rendering of Bangla conjunct characters in text and in chart labels, with a suitable Bengali web font.
- Math written with standard notation in both languages, with a plain-words reading beside every formula.
- Review of the Bangla text by native readers, ideally teachers or students, before release.

## 10. Features by Phase

**Version 1**

- Book structure with table of contents and progress.
- Single-level content in English.
- Editable figures with scroll-linked explanations.
- Explain-in-your-own-words box and Teach this cards.
- Quizzes with explanations after finishing.
- Like button and suggestion box on every sub-chapter.

**Later**

- **Bangla language support** (translated text, quizzes and interface, a shared glossary, Bengali fonts and native-reader review).
- **Audio narration in Bangla and English** (read-aloud, sentence highlighting, narration synced with figures). To keep this easy to add, the text is written in short paragraphs with stable IDs, English terms inside Bangla text are tagged, and formulas get a spoken form.
- Presenter mode for teachers, class codes and a teacher dashboard.
- Optional accounts and cloud sync.
- Spaced review and weak-spot practice.
- Offline support (app).

## 11. Technical Approach (Proposed)

- **Frontend:** Next.js or React with MDX, so each sub-chapter is a text file that embeds interactive components.
- **Visuals:** D3.js or Plotly for charts, p5.js for animation, KaTeX for equations.
- **In-browser ML:** TensorFlow.js or ONNX Runtime Web for neural network and CNN demos, and lighter hand-coded simulations where real models are not needed.
- **Reusable components:** one shared Slider, DraggablePoints, LossCurve and similar parts used across chapters.
- **State:** one state object per figure, so text, buttons, presets and quizzes can all set it.
- **Performance:** Web Workers for heavy computation, lazy loading, and lightweight pages that work on weak phones and slow connections.
- **Hosting:** static hosting (for example GitHub Pages or Vercel) to keep it free.
- **Content layout:** separate folders for content, quizzes and figure components, organized by language so Bangla can be added later without restructuring.

## 12. Roadmap

1. **Foundation:** set up the book shell (header, table of contents, progress) and the sub-chapter template.
2. **Vertical slice:** build one full chapter, Gradient Descent with 4 to 6 sub-chapters, in English with its quiz.
3. **Student test:** have a few students use it and collect feedback on clarity and enjoyment.
4. **Bangla:** translate the slice, check the fonts, glossary and chart labels, and review with native readers.
5. **Expand:** add chapters part by part, beginning with Classical ML.
6. **Polish:** add teaching features, sharing links and the full set of quizzes.
7. **Launch and improve:** release publicly and keep improving based on feedback.
8. **Future:** audio and teacher tools.

## 13. Measuring Student Satisfaction

- A simple "Was this clear?" rating (yes, somewhat, no) at the end of each sub-chapter, with an optional comment.
- Short satisfaction survey after each chapter quiz.
- Quiz scores and retake improvement, to see whether students actually learn.
- Completion and drop-off rates per sub-chapter, to find confusing places.
- Usage of the explain-in-your-own-words and Teach this features.
- Direct feedback from students and teachers in short interviews.

Sub-chapters with low clarity ratings or high drop-off are rewritten first.
