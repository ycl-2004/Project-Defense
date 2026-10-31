# 申请用介绍 · Application summary

仓库 https://github.com/ycl-2004/Project-Defense

## 一句话版本

我做了一个给青少年 AI 编程课用的项目答辩教练。学生贴上自己的 GitHub 仓库，AI 照着真实代码一层层提问和追问，最后给导师一份能逐行核对的理解反馈。

## 一段话版本

学生用 AI 很快就能做出能跑的 App，可一旦被问到某一行为什么这样写，常常答不上来。答辩教练拿这个时刻来练习。学生贴上公开的 GitHub 仓库，选一个最想讲清楚的功能，再定难度和题数。AI 读完这部分代码后出五到八道题，从讲清流程一直问到改需求时要动哪几行，每道题都标出引用的文件和行号。回答含糊时，它会抓住学生的原话追问；卡住了可以要提示，也可以直接跳过。答完以后，报告把学生的原话和对应的代码放在一起，逐题评为讲清楚、部分理解、有误解或未作答，最后给导师一个小改动任务，让学生改完再讲一遍为什么这样改。

## 面试时可以展开讲的地方

**为什么不打总分。** 五六道题证明不了一个学生真的懂，也看不出代码是谁写的。打一个总分，家长和老师很容易把它当成结论。所以报告只给逐题证据，雷达图由评价按固定规则换算，同样的回答永远画出同样的图，报告里也写明它不用来判定作弊。

**怎么保证每道题都对得上代码。** 模型只负责说出引用哪个文件的哪几行，代码片段由服务器从本场锁定的那次提交里截出来。行号对不上，服务器会把具体错在哪告诉模型，让它重写。我用真实的 DeepSeek 跑过这个项目自己和 vercel/ms 两个仓库，每一处引用都和 GitHub 上的原文逐字一致。

**做到了什么程度。** 网站用 Next.js 16 写成，部署在 Vercel，模型是 deepseek-flash。分析一个仓库约十秒，出题十几秒，每轮追问两三秒。仓库里有 76 个单元测试和一条从首页走到报告页的 Playwright 测试，CI 每次推送都会跑。界面支持中英文和深浅色，手机上也能用。

---

## One line

I built a project-defense coach for teenagers in AI programming courses. Students paste their GitHub repository, the AI asks layered questions and follow-ups about their real code, and mentors get feedback they can check line by line.

## One paragraph

With AI, students can ship a working app quickly, yet many cannot explain why a line is written the way it is. Project Defense is practice for that moment. A student pastes a public GitHub repository, picks the feature they most want to explain, and chooses a difficulty and a number of questions. After reading that part of the code, the AI asks five to eight questions, from walking through the flow to naming the lines a new requirement would change, and every question cites a file and line range. Vague answers get follow-ups that quote the student; hints and "I don't know" are always available. The report sets the student's words beside the code, rates each question as clear, partial, misconception or unanswered, and ends with one small change the mentor can ask for, so the student can make it and explain why.
