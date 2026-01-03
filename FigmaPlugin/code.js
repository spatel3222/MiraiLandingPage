// code.js — Mirai360 Slides-friendly generator
// - safe font loads
// - left-to-right slide placement (works in Slides files)
// - messages: create-next-slide, reset-counter, create-all
// - robust try/catch and notifications

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const GAP_X = 160;

const COLORS = {
  blue: { r: 0.145, g: 0.388, b: 0.922 },     // #2563EB
  white: { r: 1, g: 1, b: 1 },
  lightGray: { r: 0.953, g: 0.957, b: 0.965 },// #F3F4F6
  primaryText: { r: 0.067, g: 0.067, b: 0.067 }, // #111111
  secondaryText: { r: 0.420, g: 0.447, b: 0.502 }, // #6B7280
  red: { r: 0.933, g: 0.267, b: 0.267 },     // #EF4444
  orange: { r: 0.973, g: 0.451, b: 0.086 },  // #F97316
  teal: { r: 0.051, g: 0.582, b: 0.533 },    // #0D9488
  green: { r: 0.09, g: 0.639, b: 0.325 }     // #16A34A
};

console.clear();
console.log("Mirai360 Slides plugin: starting");

async function loadFonts() {
  const fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Bold" },
    { family: "Roboto", style: "Regular" },
    { family: "Roboto", style: "Medium" },
    { family: "Roboto", style: "Bold" }
  ];
  for (const f of fonts) {
    try {
      await figma.loadFontAsync(f);
      console.log("Loaded font", f.family, f.style);
    } catch (e) {
      console.warn("Font load failed", f.family, f.style, e);
    }
  }
}

// --- helpers
function createFrame(name, x, y, bgColor) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(SLIDE_W, SLIDE_H);
  f.x = x;
  f.y = y;
  f.fills = [{ type: "SOLID", color: bgColor }];
  // keep no auto-layout so Slides treats it as normal frame
  return f;
}

function createText(str, size=18, style="Regular", color=COLORS.primaryText, width=1200, align="LEFT") {
  const t = figma.createText();
  try { t.fontName = { family: "Inter", style }; } catch (e) { /* ignore */ }
  t.fontSize = size;
  t.characters = str;
  t.fills = [{ type: "SOLID", color }];
  t.resize(width, Math.max(24, Math.round(size * 1.3)));
  t.textAlignHorizontal = align;
  return t;
}

function rect(w, h, color, radius=12, stroke=null) {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.fills = [{ type: "SOLID", color }];
  r.cornerRadius = radius;
  if (stroke) {
    r.strokes = [{ type: "SOLID", color: stroke }];
    r.strokeWeight = 2;
  }
  return r;
}

function place(node, frame, ox, oy) {
  node.x = frame.x + ox;
  node.y = frame.y + oy;
  frame.appendChild(node);
  // debug
  console.log(`Placed node in ${frame.name} at [${node.x}, ${node.y}]`);
}

// --- slide builders (1..12) - concise but visually correct
function buildSlide1(page, x, y) {
  const f = createFrame("01_TITLE", x, y, COLORS.blue);
  place(rect(200, 80, COLORS.white, 12), f, 860, 120);
  place(createText("Mirai360", 96, "Bold", COLORS.white, 1400, "CENTER"), f, 260, 340);
  place(createText("360° Legal Intelligence: From Companies to Courts", 36, "Regular", { r:0.878,g:0.905,b:1 }, 1500, "CENTER"), f, 210, 480);
  place(rect(500, 8, COLORS.orange, 6), f, 710, 620);
  place(createText("Shivang Patel • Founder & CEO • shivang@mirai360.ai", 24, "Regular", COLORS.white, 1200, "CENTER"), f, 360, 760);
  page.appendChild(f);
  return f;
}

function buildSlide2(page, x, y) {
  const f = createFrame("02_PROBLEM", x, y, COLORS.white);
  place(createText("THE PROBLEM — The Legal Loop Is Broken", 44, "Bold", COLORS.primaryText, 1600), f, 120, 80);
  place(rect(180, 8, COLORS.red, 4), f, 120, 140);
  const cardW = 520, cardH = 320, gap = 40, left = 120, top = 200;
  place(rect(cardW, cardH, COLORS.white, 12, COLORS.red), f, left, top);
  place(rect(48,48,COLORS.red,12), f, left+20, top+20);
  place(createText("Courts", 20, "Bold", COLORS.primaryText, 400), f, left+90, top+12);
  place(createText("• 311 Cr pages digitized\n• 85% vernacular (unsearchable)", 18, "Regular", COLORS.secondaryText, 420), f, left+28, top+80);
  const lx = left + (cardW + gap);
  place(rect(cardW, cardH, COLORS.white, 12, COLORS.red), f, lx, top);
  place(rect(48,48,COLORS.red,12), f, lx+20, top+20);
  place(createText("Lawyers", 20, "Bold", COLORS.primaryText, 400), f, lx+90, top+12);
  place(createText("• No playbook automation\n• Every contract reviewed from scratch", 18, "Regular", COLORS.secondaryText, 420), f, lx+28, top+80);
  const cx = left + 2*(cardW + gap);
  place(rect(cardW, cardH, COLORS.white, 12, COLORS.red), f, cx, top);
  place(rect(48,48,COLORS.red,12), f, cx+20, top+20);
  place(createText("Companies", 20, "Bold", COLORS.primaryText, 400), f, cx+90, top+12);
  place(createText("• No proactive risk intelligence\n• Disputes surprise stakeholders", 18, "Regular", COLORS.secondaryText, 420), f, cx+28, top+80);
  place(createText("47M pending cases (NJDG)", 16, "Regular", COLORS.secondaryText, 1400), f, 120, top + cardH + 24);
  page.appendChild(f);
  return f;
}

function buildSlide3(page, x, y) {
  const f = createFrame("03_TAM", x, y, COLORS.white);
  place(createText("THE OPPORTUNITY — ₹10,000 Cr+ TAM", 44, "Bold", COLORS.primaryText, 1600), f, 120, 80);
  place(rect(220,8,COLORS.orange,4), f, 120, 148);
  const bx = 120, by = 220, bw = 360, gap = 80;
  place(rect(bw,420,COLORS.orange,12), f, bx, by+60);
  place(createText("COURTS\n₹7,210 Cr",20,"Bold",COLORS.white,bw,"CENTER"), f, bx, by+80);
  place(rect(bw,220,COLORS.orange,12), f, bx+bw+gap, by+260);
  place(createText("LAWYERS\n₹885 Cr",20,"Bold",COLORS.white,bw,"CENTER"), f, bx+bw+gap, by+280);
  place(rect(bw,480,COLORS.orange,12), f, bx+2*(bw+gap), by);
  place(createText("COMPANIES\n₹8,500 Cr",20,"Bold",COLORS.white,bw,"CENTER"), f, bx+2*(bw+gap), by+20);
  place(createText("• 500 enterprise firms → 20% have AI\n• 2,000 mid-market firms → 0% AI\n• 71% of enterprises face compliance breaches", 18, "Regular", COLORS.secondaryText, 600), f, 1300, 280);
  page.appendChild(f);
  return f;
}

function buildSlide4(page, x, y) {
  const f = createFrame("04_WHY_NOW", x, y, COLORS.white);
  place(createText("WHY NOW?", 44, "Bold", COLORS.primaryText, 1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 148);
  const colX = 120, colY = 220, gap = 480;
  place(rect(340,220,COLORS.blue,12), f, colX, colY);
  place(createText("Government Digitization\nPhase III • ₹7,210 Cr", 18, "Bold", COLORS.white, 300), f, colX+20, colY+24);
  place(rect(340,220,COLORS.teal,12), f, colX+gap, colY);
  place(createText("Market Inflection\nLegal AI 23% CAGR vs 6% Legal Services", 18, "Bold", COLORS.white, 300), f, colX+gap+20, colY+24);
  place(rect(340,220,COLORS.orange,12), f, colX+2*gap, colY);
  place(createText("Supply Gap\n87.5% lack client portals; 75% no automation", 18, "Bold", COLORS.white, 300), f, colX+2*gap+20, colY+24);
  place(rect(420,64,COLORS.blue,32), f, (SLIDE_W-420)/2, 620);
  place(createText("24-Month Window to Define Category", 20, "Bold", COLORS.white, 400, "CENTER"), f, (SLIDE_W-400)/2, 628);
  page.appendChild(f);
  return f;
}

function buildSlide5(page, x, y) {
  const f = createFrame("05_VISION", x, y, COLORS.white);
  place(createText("THE VISION — Lawyers → Courts → Companies", 36, "Bold", COLORS.primaryText, 1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 140);
  const boxW = 420, boxH = 180, gap = 120, startX = 120, startY = 220;
  place(rect(boxW,boxH,COLORS.blue,12), f, startX, startY);
  place(createText("LAWYERS\n(NOW)\nVernacular assistant • Playbook agents", 16, "Bold", COLORS.white, boxW-40), f, startX+20, startY+18);
  place(rect(80,14,COLORS.teal,6), f, startX+boxW+20, startY + boxH/2 - 7);
  place(rect(boxW,boxH,COLORS.teal,12), f, startX+boxW+gap, startY);
  place(createText("COURTS\n(NEXT)\nCase AI • eCourts integration", 16, "Bold", COLORS.white, boxW-40), f, startX+boxW+gap+20, startY+18);
  place(rect(80,14,COLORS.blue,6), f, startX+2*boxW+gap+20, startY + boxH/2 - 7);
  place(rect(boxW,boxH,COLORS.blue,12), f, startX+2*(boxW+gap), startY);
  place(createText("COMPANIES\n(LATER)\nCLM powered by playbook agents", 16, "Bold", COLORS.white, boxW-40), f, startX+2*(boxW+gap)+20, startY+18);
  page.appendChild(f);
  return f;
}

function buildSlide6(page, x, y) {
  const f = createFrame("06_PRODUCT", x, y, COLORS.white);
  place(createText("THE PRODUCT", 40, "Bold", COLORS.primaryText, 1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 144);
  const cw=520,ch=260,gap=48,startX=120,startY=220;
  place(rect(cw,ch,COLORS.white,12,COLORS.blue), f, startX, startY);
  place(createText("Vernacular Assistant\nReads 10 Indian languages",18,"Bold",COLORS.primaryText,cw-40), f, startX+20, startY+20);
  place(rect(cw,ch,COLORS.white,12,COLORS.blue), f, startX+(cw+gap), startY);
  place(createText("List of Dates Generator\nAuto-extracts case chronology",18,"Bold",COLORS.primaryText,cw-40), f, startX+(cw+gap)+20, startY+20);
  place(rect(cw,ch,COLORS.white,12,COLORS.blue), f, startX+2*(cw+gap), startY);
  place(createText("Playbook Agents\nLawyers create reusable agents",18,"Bold",COLORS.primaryText,cw-40), f, startX+2*(cw+gap)+20, startY+20);
  place(createText("UPLOAD → STRUCTURE → PLAYBOOK → AUTOMATE → SCALE",18,"Medium",COLORS.secondaryText,1600,"CENTER"), f, 160, startY + ch + 40);
  page.appendChild(f);
  return f;
}

function buildSlide7(page, x, y) {
  const f = createFrame("07_MOAT", x, y, COLORS.white);
  place(createText("DIFFERENTIATION — Our Moat",36,"Bold",COLORS.primaryText,1600), f, 120, 80);
  place(rect(220,8,COLORS.teal,4), f, 120, 144);
  const leftX = 120, rightX = 760, rowY = 220;
  const rows = ["Stack","Languages","Deployment","Architecture","Output"];
  const miraiVals = ["Full-stack (HW→OCR→AI→UI)","10 Indian languages","On-premise-first (DPDP ready)","Lawyer-customizable agents","Lawyer-grade docs"];
  const compVals = ["Software-only","English-first","Cloud-only","Fixed chatbot","Generic drafts"];
  for (let i=0;i<rows.length;i++){
    const yOff = rowY + i*80;
    place(createText(rows[i],16,"Medium",COLORS.secondaryText,240), f, leftX, yOff);
    place(createText(miraiVals[i],16,"Regular",COLORS.primaryText,520), f, leftX+160, yOff);
    place(createText(compVals[i],16,"Regular",COLORS.secondaryText,400), f, rightX, yOff);
  }
  place(rect(1320,64,COLORS.blue,12), f, 120, 640);
  place(createText("Full-stack + On-prem + Vernacular + Agent Playbooks",20,"Bold",COLORS.white,1200,"CENTER"), f, 180, 648);
  page.appendChild(f);
  return f;
}

function buildSlide8(page, x, y) {
  const f = createFrame("08_TRACTION", x, y, COLORS.white);
  place(createText("TRACTION",40,"Bold",COLORS.primaryText,1600), f, 120, 80);
  place(rect(220,8,COLORS.green,4), f, 120, 144);
  const kW=420,kH=180,gap=48,startX=120,startY=220;
  place(rect(kW,kH,COLORS.white,12,COLORS.green), f, startX, startY);
  place(createText("2 Pilots Completed",20,"Bold",COLORS.primaryText,kW-40), f, startX+20, startY+20);
  place(rect(kW,kH,COLORS.white,12,COLORS.green), f, startX + (kW+gap), startY);
  place(createText("PMF validated by Tier-1 firms",20,"Bold",COLORS.primaryText,kW-40), f, startX+(kW+gap)+20, startY+20);
  place(rect(kW,kH,COLORS.white,12,COLORS.green), f, startX + 2*(kW+gap), startY);
  place(createText("Multilingual datasets live",20,"Bold",COLORS.primaryText,kW-40), f, startX + 2*(kW+gap)+20, startY+20);
  place(rect(1240,120, { r:0.98,g:0.98,b:0.98 }, 12), f, 120, startY + kH + 36);
  place(createText("“The combination of vernacular assistant and List of Dates is priceless. No other solution meets lawyer standards.” — Senior Partner, Top-Tier Indian Law Firm",16,"Regular",COLORS.primaryText,1160), f, 140, startY + kH + 54);
  page.appendChild(f);
  return f;
}

function buildSlide9(page, x, y) {
  const f = createFrame("09_MODEL", x, y, COLORS.white);
  place(createText("BUSINESS MODEL",40,"Bold",COLORS.primaryText,1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 144);
  const leftX=120, topY=220, w=420, h=220, gap=48;
  place(rect(w,h,COLORS.white,12,COLORS.blue), f, leftX, topY);
  place(createText("Crawl\n₹2k–5k/user/mo\n30% productivity gains",18,"Bold",COLORS.primaryText,w-40), f, leftX+20, topY+20);
  place(rect(w,h,COLORS.white,12,COLORS.blue), f, leftX+(w+gap), topY);
  place(createText("Walk\n₹5k–8k/user/mo\nAI intelligence + workflows",18,"Bold",COLORS.primaryText,w-40), f, leftX+(w+gap)+20, topY+20);
  place(rect(w,h,COLORS.white,12,COLORS.blue), f, leftX+2*(w+gap), topY);
  place(createText("Run\n₹8k–12k/user/mo\nPredictive litigation + premium",18,"Bold",COLORS.primaryText,w-40), f, leftX+2*(w+gap)+20, topY+20);
  place(rect(520,160,COLORS.white,12,COLORS.secondaryText), f, 120, topY + h + 56);
  place(createText("Unit Economics\n• 85% gross margins\n• CAC payback: ~8 months\n• 96% retention (benchmarks)",16,"Regular",COLORS.primaryText,480), f, 140, topY + h + 74);
  page.appendChild(f);
  return f;
}

function buildSlide10(page, x, y) {
  const f = createFrame("10_TEAM", x, y, COLORS.lightGray);
  place(createText("THE TEAM",40,"Bold",COLORS.primaryText,1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 144);
  place(rect(540,220,COLORS.white,12,COLORS.blue), f, 120, 220);
  place(createText("Shivang Patel — Founder & CEO",22,"Bold",COLORS.primaryText,460), f, 140, 240);
  place(createText("Ex-Walmart Head of Agentic AI Platform; 20 yrs building AI/data platforms",16,"Regular",COLORS.secondaryText,460), f, 140, 276);
  place(rect(320,160,COLORS.white,12,COLORS.secondaryText), f, 700, 220);
  place(createText("AI Architect\n<name>",16,"Bold",COLORS.primaryText,288), f, 716, 236);
  place(rect(320,160,COLORS.white,12,COLORS.secondaryText), f, 700, 408);
  place(createText("Legal Advisor\n<name>",16,"Bold",COLORS.primaryText,288), f, 716, 424);
  page.appendChild(f);
  return f;
}

function buildSlide11(page, x, y) {
  const f = createFrame("11_ASK", x, y, COLORS.lightGray);
  place(createText("THE ASK",40,"Bold",COLORS.primaryText,1600), f, 120, 80);
  place(rect(220,8,COLORS.blue,4), f, 120, 144);
  place(rect(360,120,COLORS.blue,12), f, 120, 220);
  place(createText("₹1 Crore Seed",28,"Bold",COLORS.white,320,"CENTER"), f, 140, 248);
  place(createText("Milestones:\n• Convert pilots → paying\n• 5 additional law firm customers\n• ₹25L ARR\n• Court integration POC (6–8 months)",18,"Regular",COLORS.primaryText,900), f, 520, 240);
  place(rect(120,120,COLORS.blue,60), f, 120, 380);
  place(rect(120,120,COLORS.orange,60), f, 260, 380);
  place(rect(120,120,COLORS.secondaryText,60), f, 400, 380);
  page.appendChild(f);
  return f;
}

function buildSlide12(page, x, y) {
  const f = createFrame("12_CLOSING", x, y, COLORS.blue);
  place(createText("Mirai360 is building India’s Legal Operating System.",40,"Bold",COLORS.white,1600,"CENTER"), f, 160, 320);
  place(createText("One platform connecting Companies → Lawyers → Courts",24,"Regular",{ r:0.878,g:0.905,b:1 },1400,"CENTER"), f, 260, 420);
  place(createText("shivang@mirai360.ai • Ahmedabad, Gujarat",18,"Regular",COLORS.white,1200,"CENTER"), f, 360, 520);
  page.appendChild(f);
  return f;
}

// builders map
const builders = {
  1: buildSlide1,
  2: buildSlide2,
  3: buildSlide3,
  4: buildSlide4,
  5: buildSlide5,
  6: buildSlide6,
  7: buildSlide7,
  8: buildSlide8,
  9: buildSlide9,
  10: buildSlide10,
  11: buildSlide11,
  12: buildSlide12
};

// UI handling — create-next-slide, reset-counter, create-all
figma.showUI(__html__, { width: 420, height: 260 });

figma.ui.onmessage = async (msg) => {
  try {
    if (!msg || !msg.type) return;
    if (msg.type === "reset-counter") {
      figma.root.setPluginData("mirai360_next_slide", "2");
      figma.notify("Mirai360: Counter reset to Slide 2.");
      console.log("Counter reset to 2");
      return;
    }

    if (msg.type === "create-all") {
      await loadFonts();
      figma.notify("Creating all slides 1–12...");
      const page = figma.currentPage;
      const frames = [];
      let x = 0;
      for (let i=1;i<=12;i++) {
        try {
          const f = builders[i](page, x, 0);
          frames.push(f);
          x += SLIDE_W + GAP_X;
        } catch (e) {
          console.error("Error building slide", i, e);
          figma.notify(`Error building slide ${i} — check console`);
        }
      }
      figma.currentPage.selection = frames;
      figma.viewport.scrollAndZoomIntoView(frames);
      figma.root.setPluginData("mirai360_next_slide","13");
      figma.notify("Mirai360: All slides created.");
      return;
    }

    if (msg.type === "create-next-slide") {
      await loadFonts();
      const key = "mirai360_next_slide";
      let next = parseInt(figma.root.getPluginData(key) || "2", 10);
      if (isNaN(next) || next < 2) next = 2;
      if (next > 12) {
        figma.notify("Mirai360: All slides already created. Reset if you want to recreate.");
        console.log("All slides created, next =", next);
        return;
      }
      figma.notify(`Creating slide ${next}...`);
      const x = (next - 1) * (SLIDE_W + GAP_X);
      const page = figma.currentPage;
      try {
        const frame = builders[next](page, x, 0);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
        figma.root.setPluginData(key, String(next + 1));
        figma.notify(`Slide ${next} created.`);
        console.log(`Created slide ${next} at x=${x}`);
      } catch (e) {
        console.error("Error creating slide", next, e);
        figma.notify(`Error creating slide ${next} — see console.`);
      }
      return;
    }

    console.log("UI message ignored:", msg);
  } catch (err) {
    console.error("UI handler error:", err);
    figma.notify("Unexpected plugin error — check console.");
  }
};

// Support running the plugin as a command (manifest can define 'create-next' etc.)
if (figma.command === "create-next") {
  // simulate a create-next-slide message if invoked as a command
  (async () => {
    await loadFonts();
    const key = "mirai360_next_slide";
    let next = parseInt(figma.root.getPluginData(key) || "2", 10);
    if (isNaN(next) || next < 2) next = 2;
    if (next <= 12) {
      const x = (next - 1) * (SLIDE_W + GAP_X);
      try {
        const frame = builders[next](figma.currentPage, x, 0);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
        figma.root.setPluginData(key, String(next + 1));
        figma.notify(`Slide ${next} created (command).`);
        console.log(`Created slide ${next} via command`);
      } catch (e) {
        console.error("Command create-next failed", e);
      }
    } else {
      figma.notify("All slides created.");
    }
    figma.closePlugin();
  })();
}
