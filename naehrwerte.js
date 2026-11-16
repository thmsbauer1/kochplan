/* naehrwerte.js – ungefähre Kalorien für den Kochplan
   Werte je 100 g (roh bzw. wie gekauft), gerundet nach gängigen Nährwerttabellen (BLS/USDA).
   Felder: k = kcal je 100 g, st = Gramm je Stück/Dose/Bund/Scheibe/Zehe (essbarer Anteil, Dosen abgetropft),
           el = Gramm je Esslöffel, y = Garfaktor (trockene Ware nimmt beim Kochen Wasser auf: 100 g Reis → 260 g gekocht).
   Das Ergebnis ist eine Einschätzung (etwa ±15 %), keine exakte Nährwertangabe. */
window.NAEHRWERTE = {
  "risottoreis":{k:350,y:2.8},"champignons":{k:22},"blumenkohl":{k:25,st:600},"garam masala":{k:300,el:6},
  "cashewkerne":{k:580},"sojasprossen":{k:30},"gochujang":{k:200,el:20},"sesamöl":{k:884,el:10},
  "speisestärke":{k:350,el:10},"pak choi":{k:13,st:250},"ananas in stücken":{k:60,st:340},"tomatenmark":{k:80,el:15},
  "reisessig":{k:20,el:15},"udon-nudeln":{k:140},"spitzkohl":{k:25},"aubergine":{k:24,st:300},
  "getrocknete aprikosen":{k:240},"ras el hanout":{k:300,el:6},"grüne oliven":{k:145},
  "avocado":{k:160,st:150},"babyspinat":{k:23},"baguette":{k:260,st:250},"balsamico":{k:90,el:15},
  "basilikum":{k:23,st:20},"basmatireis":{k:350,y:2.6},"berglinsen":{k:330,y:2.4},"brokkoli":{k:34,st:400},
  "bulgur":{k:340,y:2.5},"cherrytomaten":{k:20},"chiliflocken":{k:0},"ciabatta":{k:260,st:300},
  "couscous":{k:360,y:2.5},"currypulver":{k:325,el:6},"dill":{k:43,st:20},"edamame":{k:120},
  "eier":{k:140,st:55},"ei":{k:140,st:55},"eisbergsalat":{k:14,st:500},"erbsen":{k:80},"erdnussbutter":{k:600,el:15},
  "feta":{k:270},"fladenbrot":{k:260,st:400},"frischkäse light":{k:160},"frischkäse":{k:250},"frühlingszwiebeln":{k:32,st:100},
  "garnelen":{k:70},"gehackte tomaten":{k:22,st:400},"gelbe currypaste":{k:110,el:15},"rote currypaste":{k:110,el:15},
  "gemüsebrühe":{k:2},"geriebener käse":{k:360},"gnocchi":{k:160},"griechischer joghurt":{k:120},
  "gurke":{k:12,st:400},"gyros-gewürz":{k:300,el:6},"halloumi":{k:320},"hokkaido-kürbis":{k:50,st:1000},
  "honig":{k:304,el:20},"hähnchenbrust":{k:105},"ingwer":{k:80,st:20},"kabeljaufilet":{k:77},
  "karotten":{k:36,st:80},"kartoffeln festkochend":{k:72},"kartoffeln":{k:72},"kichererbsen":{k:120,st:240},
  "kidneybohnen":{k:110,st:250},"knoblauch":{k:140,st:4},"kokosmilch":{k:180,st:400},"kokosmilch light":{k:75,st:400},"koriander":{k:23,st:20},
  "kreuzkümmel":{k:375,el:6},"kurkuma":{k:350,el:6},"kürbiskerne":{k:560},"lachsfilet":{k:200},
  "lauch":{k:30,st:250},"limette":{k:30,st:40},"zitrone":{k:35,st:40},"magerquark":{k:67},"mais":{k:80,st:285},
  "mehl":{k:350},"mie-nudeln":{k:360,y:2.3},"milch":{k:50},"minze":{k:45,st:20},"mozzarella":{k:250,st:125},
  "naturjoghurt":{k:65},"olivenöl":{k:884,el:10},"öl":{k:884,el:10},"paella-reis":{k:350,y:3},"panko":{k:380},
  "paprika rot":{k:35,st:160},"paprika gelb":{k:30,st:160},"paprika":{k:32,st:160},"paprikapulver":{k:300,el:6},
  "parmesan":{k:400},"petersilie":{k:50,st:30},"pinienkerne":{k:680},"putenbrust":{k:105},"quinoa":{k:360,y:2.7},
  "ricotta":{k:150},"romanasalat":{k:17,st:300},"rote linsen":{k:340,y:2.5},"rote zwiebel":{k:40,st:100},
  "rotkohl":{k:30},"rucola":{k:25},"safran":{k:0},"salz":{k:0},"salz, pfeffer":{k:0},"pfeffer":{k:0},
  "schmand":{k:240},"schnittlauch":{k:30,st:25},"schwarze bohnen":{k:130,st:240},"seelachsfilet":{k:80},
  "senf":{k:90,el:15},"sesam":{k:570,el:8},"sojasauce":{k:55,el:15},"stangensellerie":{k:16,st:60},
  "suppennudeln":{k:360,y:2.3},"sushireis oder basmati":{k:350,y:2.4},"süßkartoffeln":{k:86,st:300},
  "thunfisch im eigenen saft":{k:110,st:150},"tofu natur":{k:125},"tofu":{k:125},"vollkornpasta":{k:350,y:2.3},
  "vollkornspaghetti":{k:350,y:2.3},"vollkorntoast":{k:250,st:30},"weizen-tortillas":{k:300,st:60},
  "weiße bohnen":{k:110,st:250},"zucchini":{k:20,st:250},"zuckerschoten":{k:42},"zwiebel":{k:40,st:100}
};
/* Für eigene Rezepte: grobe Werte nach Stichwort, wenn die Zutat nicht in der Liste steht */
window.NAEHRWERTE_REGELN = [
  [/olivenöl|rapsöl|\böl\b/i,{k:884,el:10}],[/butter/i,{k:740,el:12}],[/sahne/i,{k:300}],[/crème fraîche|creme fraiche/i,{k:290}],
  [/parmesan|pecorino/i,{k:400}],[/käse|gouda|emmentaler|cheddar/i,{k:360}],[/mozzarella/i,{k:250,st:125}],
  [/quark/i,{k:70}],[/joghurt/i,{k:65}],[/milch/i,{k:50}],[/\beier?\b/i,{k:140,st:55}],
  [/spaghetti|nudel|pasta|penne|fusilli|tagliatelle|lasagne/i,{k:355,y:2.3}],[/reis/i,{k:350,y:2.6}],
  [/linsen/i,{k:335,y:2.4}],[/couscous|bulgur|quinoa|hirse/i,{k:355,y:2.5}],[/haferflocken/i,{k:370}],
  [/kichererbsen|bohnen/i,{k:115,st:240}],[/kartoffel/i,{k:72}],[/süßkartoffel/i,{k:86,st:300}],
  [/brot|brötchen|toast|baguette|ciabatta|tortilla|wrap/i,{k:260,st:60}],[/mehl/i,{k:350}],[/zucker/i,{k:400,el:15}],
  [/honig|sirup/i,{k:310,el:20}],[/nüsse|nuss|mandeln|kerne|cashew/i,{k:600}],[/erdnussbutter|tahin/i,{k:600,el:15}],
  [/lachs/i,{k:200}],[/thunfisch/i,{k:110,st:150}],[/garnele|shrimp|scampi/i,{k:70}],[/fisch|kabeljau|seelachs|forelle|dorade/i,{k:85}],
  [/hähnchen|haehnchen|huhn|pute|geflügel/i,{k:110}],[/hackfleisch|hack/i,{k:250}],[/rind/i,{k:150}],[/schwein/i,{k:180}],
  [/schinken/i,{k:120}],[/speck|bacon/i,{k:400}],[/wurst/i,{k:280}],[/tofu/i,{k:125}],
  [/kokosmilch light/i,{k:75,st:400}],[/kokosmilch/i,{k:180,st:400}],[/tomaten.*dose|passierte|gehackte tomaten/i,{k:22,st:400}],[/avocado/i,{k:160,st:150}],
  [/salz|pfeffer|gewürz|kräuter|zimt|chili|curry|paprikapulver|safran/i,{k:0}],[/brühe|fond/i,{k:2}],[/wasser/i,{k:0}]
];
