# ML Beginner Notes For This Project

This project uses machine learning for one task only:

> Given a short text, predict whether it is English, Yoruba, Hausa, or Igbo.

The model is not translating text. It is not diagnosing symptoms. It is not understanding the patient's medical problem. It only learns text patterns that help identify the language.

## 1. What The Dataset Means

The model needs examples like this:

| text | language |
| --- | --- |
| I want to book an appointment | english |
| Mo fe ri dokita | yoruba |
| Ina son ganin likita | hausa |
| Achoro m ihu dokita | igbo |

Each row teaches the model:

> "When you see text that looks like this, the correct language label is this."

If the examples are bad, the model will be bad. This is why dataset collection is the most important part of the project.

## 2. Why We Need Manual Healthcare Samples

External datasets often contain news, religion, or general text. But our app receives hospital booking text, such as:

- "I want to see a doctor."
- "Can I reschedule my appointment?"
- "My child has a fever."

So we need manual healthcare samples in all four languages. These help the model handle the kind of text users will actually type.

## 3. What Feature Extraction Means

Computers cannot directly learn from raw words. We must convert text into numbers.

For this project, we use character n-grams.

Example:

`doctor`

Character chunks may include:

- `do`
- `doc`
- `doct`
- `oc`
- `oct`

The model learns which character patterns are common in each language. This is useful because Yoruba, Hausa, and Igbo may have different spelling patterns, diacritics, and common word fragments.

## 4. What Training Means

Training means showing the model many labeled examples.

The model sees:

- text
- correct language label

Then it learns a pattern that maps future text to a predicted language.

## 5. What Testing Means

We must not test the model on the same examples it trained on.

So we split the dataset:

- Training set: used to teach the model.
- Test set: used to check whether the model can predict unseen examples.

This prevents us from fooling ourselves with inflated results.

## 6. What Evaluation Metrics Mean

Accuracy answers:

> Out of all predictions, how many were correct?

Precision answers:

> When the model says "Yoruba", how often is it really Yoruba?

Recall answers:

> Out of all real Yoruba examples, how many did the model find?

F1-score balances precision and recall.

For the dissertation, F1-score per language is more useful than accuracy alone.

## 7. What Success Looks Like

For this project, a strong result would be:

- Each language has enough examples.
- Manual healthcare samples are included.
- F1-score is high for English, Yoruba, Hausa, and Igbo.
- The web app switches interface language after detecting the user's text.
- Manual language selection is still available if automatic detection is wrong.
