"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable: object-literal-sort-keys
const RANKING_LIST = {
    "elm/core": "0001",
    "elm/html": "0002",
    "elm/browser": "0003",
    "elm/json": "0004",
    "elm/http": "0005",
    "elm/url": "0006",
    "elm/time": "0007",
    "elm-explorations/test": "0008",
    "elm/random": "0009",
    "elm-community/list-extra": "0010",
    "elm/svg": "0011",
    "NoRedInk/elm-json-decode-pipeline": "0012",
    "mdgriffith/elm-ui": "0013",
    "rtfeldman/elm-css": "0014",
    "elm/regex": "0015",
    "elm/parser": "0016",
    "avh4/elm-color": "0017",
    "elm-explorations/markdown": "0018",
    "krisajenkins/remotedata": "0019",
    "elm-community/maybe-extra": "0020",
    "elm/file": "0021",
    "elm-community/random-extra": "0022",
    "rtfeldman/elm-iso8601-date-strings": "0023",
    "rundis/elm-bootstrap": "0024",
    "elm-community/json-extra": "0025",
    "justinmimbs/date": "0026",
    "elm-community/string-extra": "0027",
    "elm-explorations/linear-algebra": "0028",
    "mpizenberg/elm-pointer-events": "0029",
    "elm/bytes": "0030",
    "elm/virtual-dom": "0031",
    "ryannhg/date-format": "0032",
    "elm-community/result-extra": "0033",
    "myrho/elm-round": "0034",
    "elm-explorations/webgl": "0035",
    "dillonkearns/elm-graphql": "0036",
    "elm-community/typed-svg": "0037",
    "dillonkearns/elm-pages": "0038",
    "elm-community/dict-extra": "0039",
    "rtfeldman/elm-hex": "0040",
    "justinmimbs/time-extra": "0041",
    "noahzgordon/elm-color-extra": "0042",
    "lukewestby/elm-string-interpolate": "0043",
    "elm-community/html-extra": "0044",
    "ohanhi/keyboard": "0045",
    "joakin/elm-canvas": "0046",
    "truqu/elm-base64": "0047",
    "ianmackenzie/elm-geometry": "0048",
    "mdgriffith/elm-markup": "0049",
    "lukewestby/elm-http-builder": "0050",
    "MacCASOutreach/graphicsvg": "0051",
    "elm-explorations/benchmark": "0052",
    "rtfeldman/elm-validate": "0053",
    "gampleman/elm-visualization": "0054",
    "evancz/elm-playground": "0055",
    "danyx23/elm-uuid": "0056",
    "mdgriffith/elm-style-animation": "0057",
    "pablohirafuji/elm-markdown": "0058",
    "elm-community/array-extra": "0059",
    "hecrj/html-parser": "0060",
    "Skinney/murmur3": "0061",
    "timjs/elm-collage": "0062",
    "surprisetalk/elm-bulma": "0063",
    "lattyware/elm-fontawesome": "0064",
    "elm-community/basics-extra": "0065",
    "cuducos/elm-format-number": "0066",
    "terezka/line-charts": "0067",
    "Janiczek/cmd-extra": "0068",
    "ianmackenzie/elm-units": "0069",
    "feathericons/elm-feather": "0070",
    "folkertdev/one-true-path-experiment": "0071",
    "elm-community/graph": "0072",
    "Fresheyeball/elm-return": "0073",
    "debois/elm-dom": "0074",
    "dillonkearns/elm-markdown": "0075",
    "elm-community/easing-functions": "0076",
    "elm-community/intdict": "0077",
    "jinjor/elm-debounce": "0078",
    "mgold/elm-nonempty-list": "0079",
    "truqu/elm-md5": "0080",
    "fapian/elm-html-aria": "0081",
    "wernerdegroot/listzipper": "0082",
    "danfishgold/base64-bytes": "0083",
    "bartavelle/json-helpers": "0084",
    "ianmackenzie/elm-geometry-svg": "0085",
    "ryannhg/elm-spa": "0086",
    "PanagiotisGeorgiadis/elm-datetime": "0087",
    "arturopala/elm-monocle": "0088",
    "andrewMacmurray/elm-delay": "0089",
    "elm/project-metadata-utils": "0090",
    "stil4m/elm-syntax": "0091",
    "CurrySoftware/elm-datepicker": "0092",
    "Chadtech/elm-bool-extra": "0093",
    "billstclair/elm-port-funnel": "0094",
    "pzp1997/assoc-list": "0095",
    "lynn/elm-arithmetic": "0096",
    "miniBill/elm-codec": "0097",
    "turboMaCk/any-dict": "0098",
    "simonh1000/elm-jwt": "0099",
    "klazuka/elm-json-tree-view": "0100",
    "arowM/elm-form-decoder": "0101",
    "justinmimbs/timezone-data": "0102",
    "pablohirafuji/elm-syntax-highlight": "0103",
    "billstclair/elm-websocket-client": "0104",
    "Gizra/elm-keyboard-event": "0105",
    "aforemny/material-components-web-elm": "0106",
    "tesk9/palette": "0107",
    "the-sett/elm-color": "0108",
    "ohanhi/remotedata-http": "0109",
    "pablen/toasty": "0110",
    "jweir/elm-iso8601": "0111",
    "abadi199/elm-input-extra": "0112",
    "mgold/elm-animation": "0113",
    "zaboco/elm-draggable": "0114",
    "justgage/tachyons-elm": "0115",
    "truqu/elm-oauth2": "0116",
    "capitalist/elm-octicons": "0117",
    "elm-community/undo-redo": "0118",
    "zwilias/elm-rosetree": "0119",
    "Punie/elm-parser-extras": "0120",
    "justgook/elm-image": "0121",
    "j-panasiuk/elm-ionicons": "0122",
    "norpan/elm-html5-drag-drop": "0123",
    "annaghi/dnd-list": "0124",
    "mdgriffith/style-elements": "0125",
    "frandibar/elm-font-awesome-5": "0126",
    "etaque/elm-form": "0127",
    "avh4/elm-program-test": "0128",
    "elm-community/list-split": "0129",
    "jzxhuang/http-extras": "0130",
    "danmarcab/material-icons": "0131",
    "ccapndave/elm-update-extra": "0132",
    "SwiftsNamesake/proper-keyboard": "0133",
    "lovasoa/elm-csv": "0134",
    "GlobalWebIndex/cmd-extra": "0135",
    "AdrianRibao/elm-derberos-date": "0136",
    "NoRedInk/elm-string-conversions": "0137",
    "TSFoster/elm-uuid": "0138",
    "basti1302/elm-human-readable-filesize": "0139",
    "ianmackenzie/elm-1d-parameter": "0140",
    "toastal/either": "0141",
    "cmditch/elm-bigint": "0142",
    "jamesmacaulay/elm-graphql": "0143",
    "ContaSystemer/elm-menu": "0144",
    "NoRedInk/elm-random-pcg-extended": "0145",
    "tesk9/accessible-html": "0146",
    "BrianHicks/elm-css-reset": "0147",
    "ktonon/elm-crypto": "0148",
    "matthewsj/elm-ordering": "0149",
    "gingko/time-distance": "0150",
    "ahstro/elm-bulma-classes": "0151",
    "ccapndave/elm-flat-map": "0152",
    "tortus/elm-array-2d": "0153",
    "hecrj/composable-form": "0154",
    "folkertdev/elm-deque": "0155",
    "perzanko/elm-loading": "0156",
    "Skinney/keyboard-events": "0157",
    "kalutheo/elm-ui-explorer": "0158",
    "turboMaCk/any-set": "0159",
    "gampleman/elm-mapbox": "0160",
    "ianmackenzie/elm-3d-camera": "0161",
    "billstclair/elm-localstorage": "0162",
    "damienklinnert/elm-spinner": "0163",
    "lovasoa/elm-rolling-list": "0164",
    "cappyzawa/elm-ui-colors": "0165",
    "turboMaCk/lazy-tree-with-zipper": "0166",
    "folkertdev/elm-state": "0167",
    "joneshf/elm-tagged": "0168",
    "Gizra/elm-all-set": "0169",
    "jinjor/elm-diff": "0170",
    "billstclair/elm-sha256": "0171",
    "TSFoster/elm-sha1": "0172",
    "visotype/elm-dom": "0173",
    "linuss/smooth-scroll": "0174",
    "rluiten/elm-text-search": "0175",
    "NoRedInk/elm-uuid": "0176",
    "alex-tan/elm-dialog": "0177",
    "tripokey/elm-fuzzy": "0178",
    "TSFoster/elm-tuple-extra": "0179",
    "Gizra/elm-debouncer": "0180",
    "webbhuset/elm-json-decode": "0181",
    "lucamug/style-framework": "0182",
    "NoRedInk/elm-compare": "0183",
    "NoRedInk/elm-simple-fuzzy": "0184",
    "marcosh/elm-html-to-unicode": "0185",
    "billstclair/elm-sortable-table": "0186",
    "ggb/numeral-elm": "0187",
    "pablohirafuji/elm-qrcode": "0188",
    "stoeffel/elm-verify": "0189",
    "jorgengranseth/elm-string-format": "0190",
    "fredcy/elm-parseint": "0191",
    "icidasset/elm-binary": "0192",
    "tesk9/accessible-html-with-css": "0193",
    "zwilias/elm-utf-tools": "0194",
    "Orasund/elm-game-essentials": "0195",
    "CoderDennis/elm-time-format": "0196",
    "zwilias/elm-html-string": "0197",
    "simonh1000/elm-colorpicker": "0198",
    "mcordova47/elm-natural-ordering": "0199",
    "carwow/elm-slider": "0200",
    "jxxcarlson/elm-markdown": "0201",
    "thaterikperson/elm-strftime": "0202",
    "mdgriffith/stylish-elephants": "0203",
    "ericgj/elm-csv-decode": "0204",
    "the-sett/lazy-list": "0205",
    "avh4/elm-fifo": "0206",
    "ianmackenzie/elm-triangular-mesh": "0207",
    "miyamoen/select-list": "0208",
    "achutkiran/material-components-elm": "0209",
    "mthadley/elm-hash-routing": "0210",
    "krisajenkins/elm-astar": "0211",
    "ianmackenzie/elm-units-interval": "0212",
    "yotamDvir/elm-pivot": "0213",
    "dillonkearns/elm-oembed": "0214",
    "Janiczek/elm-graph": "0214",
    "the-sett/elm-refine": "0214",
    "pilatch/flip": "0215",
    "Chadtech/unique-list": "0216",
    "arowM/elm-reference": "0217",
    "1602/elm-feather": "0218",
    "ChristophP/elm-i18next": "0219",
    "BrianHicks/elm-particle": "0220",
    "NoRedInk/elm-sortable-table": "0221",
    "the-sett/decode-generic": "0222",
    "jgrenat/elm-html-test-runner": "0223",
    "billstclair/elm-xml-eeue56": "0224",
    "Kraxorax/elm-matrix-a": "0225",
    "erlandsona/assoc-set": "0226",
    "arowM/elm-neat-layout": "0227",
    "ivadzy/bbase64": "0228",
    "folkertdev/elm-flate": "0229",
    "tricycle/elm-embed-youtube": "0230",
    "jinjor/elm-xml-parser": "0231",
    "cultureamp/elm-css-modules-loader": "0232",
    "krisajenkins/elm-exts": "0233",
    "periodic/elm-csv": "0234",
    "rtfeldman/elm-sorter-experiment": "0235",
    "Chadtech/id": "0236",
    "gicentre/elm-vegalite": "0237",
    "joakin/elm-grid": "0238",
    "NoRedInk/list-selection": "0239",
    "LesleyLai/elm-grid": "0240",
    "ThinkAlexandria/elm-pretty-print-json": "0241",
    "Microsoft/elm-json-tree-view": "0242",
    "elm-athlete/athlete": "0243",
    "the-sett/elm-serverless": "0244",
    "dmy/elm-pratt-parser": "0245",
    "cultureamp/babel-elm-assets-plugin": "0246",
    "WhileTruu/elm-smooth-scroll": "0247",
    "Spaxe/svg-pathd": "0248",
    "Zinggi/elm-game-resources": "0249",
    "drathier/elm-graph": "0250",
    "arowM/elm-mixin": "0251",
    "EdutainmentLIVE/elm-dropdown": "0252",
    "Zinggi/elm-2d-game": "0253",
    "xarvh/elm-slides": "0254",
    "the-sett/elm-state-machines": "0255",
    "andre-dietrich/parser-combinators": "0256",
    "rogeriochaves/elm-test-bdd-style": "0257",
    "EdutainmentLIVE/elm-bootstrap": "0258",
    "hrldcpr/elm-cons": "0259",
    "kirchner/elm-selectize": "0260",
    "ianmackenzie/elm-geometry-linear-algebra-interop": "0261",
    "stoeffel/set-extra": "0262",
    "FabienHenon/elm-infinite-list-view": "0263",
    "blissfully/elm-chartjs-webcomponent": "0264",
    "kuon/elm-string-normalize": "0265",
    "rluiten/stringdistance": "0266",
    "dillonkearns/elm-cli-options-parser": "0267",
    "jfmengels/lint-unused": "0268",
    "mgold/elm-geojson": "0269",
    "Voronchuk/hexagons": "0270",
    "y0hy0h/ordered-containers": "0271",
    "yotamDvir/elm-katex": "0272",
    "joshforisha/elm-html-entities": "0273",
    "Garados007/elm-svg-parser": "0274",
    "jxxcarlson/elm-pseudorandom": "0275",
    "prikhi/http-tasks": "0276",
    "jfmengels/elm-review": "0277",
    "pd-andy/tuple-extra": "0278",
    "Orasund/elm-ui-framework": "0278",
    "folkertdev/svg-path-lowlevel": "0279",
    "erosson/number-suffix": "0280",
    "ianmackenzie/elm-float-extra": "0281",
    "ianmackenzie/elm-interval": "0282",
    "jfmengels/review-unused": "0283",
    "Herteby/enum": "0284",
    "Chadtech/return": "0285",
    "arowM/elm-classname": "0286",
    "etaque/elm-transit": "0287",
    "json-tools/json-value": "0288",
    "stephenreddek/elm-emoji": "0289",
    "brandly/elm-dot-lang": "0290",
    "Orasund/pixelengine": "0291",
    "zwilias/elm-bytes-parser": "0292",
    "driebit/elm-css-breakpoint": "0293",
    "newlandsvalley/elm-binary-base64": "0294",
    "jordymoos/pilf": "0295",
    "stil4m/structured-writer": "0296",
    "w0rm/elm-physics": "0297",
    "harrysarson/elm-complex": "0298",
    "mhoare/elm-stack": "0299",
    "bburdette/websocket": "0300",
    "tomjkidd/elm-multiway-tree-zipper": "0301",
    "the-sett/elm-pretty-printer": "0302",
    "abradley2/elm-datepicker": "0303",
    "Kinto/elm-kinto": "0304",
    "jonoabroad/commatosed": "0305",
    "tiziano88/elm-protobuf": "0306",
    "waratuman/elm-coder": "0307",
    "eriktim/elm-protocol-buffers": "0308",
    "alex-tan/elm-tree-diagram": "0309",
    "Bractlet/elm-plot": "0310",
    "sporto/time-distance": "0311",
    "Orasund/elm-action": "0312",
    "isaacseymour/deprecated-time": "0313",
    "terezka/elm-charts": "0314",
    "sporto/elm-select": "0315",
    "marshallformula/elm-swiper": "0316",
    "the-sett/elm-string-case": "0317",
    "rgrempel/elm-http-decorators": "0318",
    "Chadtech/random-pipeline": "0319",
    "Janiczek/transform": "0320",
    "allo-media/canopy": "0321",
    "kuzminadya/mogeefont": "0322",
    "doanythingfordethklok/snackbar": "0323",
    "jxxcarlson/elm-cell-grid": "0324",
    "the-sett/elm-syntax-dsl": "0325",
    "pd-andy/elm-web-audio": "0326",
    "folkertdev/elm-int64": "0327",
    "folkertdev/elm-sha2": "0327",
    "jaredramirez/elm-s3": "0327",
    "billstclair/elm-crypto-string": "0327",
    "YuyaAizawa/list-wrapper": "0327",
    "toastal/select-prism": "0327",
    "prikhi/bootstrap-gallery": "0327",
    "laserpants/elm-update-pipeline": "0327",
    "savardd/elm-time-travel": "0327",
    "ljuglaret/fraction": "0327",
    "elm-in-elm/compiler": "0327",
    "jxxcarlson/elm-typed-time": "0327",
    "anatol-1988/measurement": "0327",
    "truqu/line-charts": "0327",
    "coinop-logan/elm-format-number": "0327",
    "abinayasudhir/html-parser": "0328",
    "the-sett/elm-aws-core": "0329",
    "newmana/chroma-elm": "0330",
    "vito/elm-ansi": "0331",
    "dosarf/elm-tree-view": "0332",
    "folkertdev/elm-paragraph": "0333",
    "nikita-volkov/hashing-containers": "0334",
    "z5h/component-result": "0335",
    "ktonon/elm-word": "0336",
    "waratuman/time-extra": "0337",
    "BrianHicks/elm-trend": "0338",
    "Chadtech/elm-vector": "0339",
    "MartinSStewart/elm-codec-bytes": "0340",
    "owanturist/elm-union-find": "0341",
    "nikita-volkov/typeclasses": "0342",
    "jxxcarlson/hex": "0343",
    "BrianHicks/elm-string-graphemes": "0344",
    "ccapndave/focus": "0345",
    "NoRedInk/elm-random-general": "0346",
    "prikhi/decimal": "0347",
    "proda-ai/elm-dropzone": "0348",
    "RomanErnst/erl": "0349",
    "JonRowe/elm-jwt": "0350",
    "etaque/elm-transit-style": "0351",
    "NoRedInk/datetimepicker-legacy": "0352",
    "webbhuset/elm-actor-model": "0353",
    "json-tools/json-schema": "0354",
    "the-sett/elm-update-helper": "0355",
    "billstclair/elm-custom-element": "0356",
    "tesk9/modal": "0357",
    "ymtszw/elm-xml-decode": "0358",
    "rl-king/elm-gallery": "0359",
    "arsduo/elm-dom-drag-drop": "0360",
    "zwilias/json-decode-exploration": "0361",
    "etaque/elm-response": "0362",
    "kuzzmi/elm-gravatar": "0363",
    "billstclair/elm-oauth-middleware": "0364",
    "alexkorban/uicards": "0365",
    "w0rm/elm-slice-show": "0366",
    "dmy/elm-imf-date-time": "0367",
    "stoeffel/editable": "0368",
    "icidasset/elm-material-icons": "0369",
    "FabienHenon/elm-infinite-scroll": "0370",
    "emilianobovetti/edit-distance": "0371",
    "ThinkAlexandria/elm-drag-locations": "0372",
    "xarvh/elm-gamepad": "0373",
    "Punie/elm-reader": "0374",
    "gicentre/elm-vega": "0375",
    "webbhuset/elm-actor-model-elm-ui": "0376",
    "arowM/html-extra": "0377",
    "zgohr/elm-csv": "0378",
    "fifth-postulate/elm-csv-decode": "0379",
    "danyx23/elm-mimetype": "0380",
    "prozacchiwawa/elm-keccak": "0381",
    "xilnocas/step": "0382",
    "mikaxyz/elm-cropper": "0383",
    "prozacchiwawa/elm-urlbase64": "0384",
    "hecrj/elm-slug": "0385",
    "sporto/qs": "0386",
    "Chadtech/elm-relational-database": "0387",
    "jschomay/elm-bounded-number": "0388",
    "kuon/elm-hsluv": "0389",
    "avh4/elm-beautiful-example": "0390",
    "arowM/elm-form-validator": "0391",
    "Elm-Canvas/raster-shapes": "0392",
    "Chadtech/elm-money": "0393",
    "larribas/elm-multi-input": "0394",
    "jschomay/elm-paginate": "0395",
    "lukewestby/elm-template": "0396",
    "ohanhi/lorem": "0397",
    "stephenreddek/elm-time-picker": "0398",
    "viir/simplegamedev": "0399",
    "Orasund/elm-cellautomata": "0400",
    "RalfNorthman/elm-zoom-plot": "0401",
    "PanagiotisGeorgiadis/elm-datepicker": "0402",
    "jxxcarlson/elm-graph": "0403",
    "jjant/elm-printf": "0404",
    "avh4/elm-debug-controls": "0405",
    "avh4/elm-dropbox": "0406",
    "billstclair/elm-id-search": "0407",
    "rl-king/elm-modular-scale": "0408",
    "thought2/elm-interactive": "0409",
    "hermanverschooten/ip": "0410",
    "peterszerzo/line-charts": "0411",
    "andre-dietrich/elm-random-regex": "0412",
    "Punie/elm-matrix": "0413",
    "flowlang-cc/elm-audio-graph": "0414",
    "andre-dietrich/elm-svgbob": "0415",
    "jigargosar/elm-material-color": "0416",
    "cmditch/elm-ethereum": "0417",
    "icidasset/elm-sha": "0418",
    "ringvold/elm-iso8601-date-strings": "0419",
    "wittjosiah/elm-ordered-dict": "0420",
    "ktonon/elm-test-extra": "0421",
    "abadi199/elm-creditcard": "0422",
    "billstclair/elm-svg-button": "0423",
    "indicatrix/elm-input-extra": "0424",
    "rl-king/elm-inview": "0425",
    "jschomay/elm-narrative-engine": "0426",
    "dwyl/elm-criteria": "0427",
    "nathanjohnson320/elm-ui-components": "0428",
    "prikhi/paginate": "0429",
    "romstad/elm-chess": "0430",
    "gdamjan/elm-identicon": "0431",
    "rluiten/trie": "0432",
    "FabienHenon/jsonapi": "0433",
    "alexanderkiel/elm-mdc-alpha": "0434",
    "NoRedInk/elm-plot-19": "0435",
    "NoRedInk/noredink-ui": "0436",
    "samhstn/time-format": "0437",
    "jfmengels/lint-debug": "0438",
    "nathanjohnson320/base58": "0439",
    "Punie/elm-id": "0440",
    "noahzgordon/elm-jsonapi": "0441",
    "labzero/elm-google-geocoding": "0442",
    "PaackEng/elm-svg-string": "0443",
    "drathier/elm-test-tables": "0444",
    "jouderianjr/elm-dialog": "0445",
    "ozmat/elm-forms": "0446",
    "dawehner/elm-colorbrewer": "0447",
    "benthepoet/elm-purecss": "0448",
    "supermario/elm-countries": "0449",
    "torreyatcitty/the-best-decimal": "0450",
    "terezka/yaml": "0451",
    "inkuzmin/elm-multiselect": "0452",
    "JeremyBellows/elm-bootstrapify": "0453",
    "ghivert/elm-graphql": "0454",
    "JohnBugner/elm-bag": "0455",
    "Gizra/elm-compat-019": "0456",
    "zwilias/elm-reorderable": "0457",
    "goilluminate/elm-fancy-daterangepicker": "0458",
    "janjelinek/creditcard-validation": "0459",
    "ir4y/elm-dnd": "0460",
    "peterszerzo/elm-arborist": "0461",
    "stephenreddek/elm-range-slider": "0462",
    "jinjor/elm-contextmenu": "0463",
    "turboMaCk/queue": "0464",
    "fabiommendes/elm-iter": "0465",
    "akoppela/elm-logo": "0466",
    "fedragon/elm-typed-dropdown": "0467",
    "emilianobovetti/elm-yajson": "0468",
    "TSFoster/elm-heap": "0469",
    "ozmat/elm-validation": "0470",
    "the-sett/ai-search": "0471",
    "jackfranklin/elm-parse-link-header": "0472",
    "Gizra/elm-attribute-builder": "0473",
    "1602/json-value": "0474",
    "peterszerzo/elm-porter": "0475",
    "jweir/sparkline": "0476",
    "ohanhi/autoexpand": "0477",
    "bChiquet/elm-accessors": "0478",
    "jxxcarlson/htree": "0479",
    "billstclair/elm-dialog": "0480",
    "billstclair/elm-websocket-framework": "0481",
    "Chadtech/elm-css-grid": "0482",
    "chicode/lisa": "0483",
    "jfmengels/elm-lint": "0484",
    "billstclair/elm-mastodon": "0485",
    "dillonkearns/elm-rss": "0486",
    "dillonkearns/elm-sitemap": "0486",
    "justgook/elm-tiled": "0486",
    "dasch/crockford": "0486",
    "showell/meta-elm": "0486",
    "calions-app/env": "0486",
    "Orasund/elm-jsonstore": "0486",
    "jfmengels/review-debug": "0486",
    "JustinLove/elm-twitch-api": "0487",
    "the-sett/the-sett-laf": "0488",
    "Chadtech/ct-colors": "0489",
    "bburdette/toop": "0490",
    "arowM/html": "0491",
    "bburdette/schelme": "0492",
    "miyamoen/bibliopola": "0493",
    "ThinkAlexandria/css-in-elm": "0494",
    "jxxcarlson/meenylatex": "0495",
    "rjbma/elm-listview": "0496",
    "henne90gen/elm-pandas-visualization": "0496",
    "waratuman/elm-standardapi": "0496",
    "waratuman/json-extra": "0496",
    "cappyzawa/elm-ui-onedark": "0496",
    "wolfadex/elm-text-adventure": "0496",
    "billstclair/elm-mastodon-websocket": "0496",
    "bburdette/pdf-element": "0496",
    "showell/binary-tree-diagram": "0496",
    "showell/dict-dot-dot": "0496",
    "sashaafm/eetf": "0496",
    "rl-king/elm-masonry": "0496",
    "dosarf/elm-yet-another-polling": "0496",
    "calions-app/app-object": "0496",
    "calions-app/jsonapi-http": "0496",
    "calions-app/remote-resource": "0496",
    "calions-app/test-attribute": "0496",
    "ronanyeah/helpers": "0496",
    "brian-watkins/elm-procedure": "0496",
    "brian-watkins/elm-spec": "0496",
    "nicmr/compgeo": "0496",
    "jxxcarlson/elm-text-editor": "0496",
    "jfmengels/elm-lint-reporter": "0496",
    "skyqrose/assoc-list-extra": "0497",
    "visotype/elm-eval": "0498",
    "commonmind/elm-csexpr": "0499",
    "yumlonne/elm-japanese-calendar": "0500",
    "jxxcarlson/elm-tar": "0501",
    "Gizra/elm-fetch": "0502",
    "jxxcarlson/math-markdown": "0503",
    "vViktorPL/elm-jira-connector": "0504",
    "billstclair/elm-websocket-framework-server": "0505",
    "simplystuart/elm-scroll-to": "0506",
    "alex-tan/postgrest-client": "0507",
    "maca/crdt-replicated-tree": "0508",
    "avh4/elm-desktop-app": "0509",
    "ensoft/entrance": "0510",
    "ceddlyburge/elm-bootstrap-starter-master-view": "0511",
    "rluiten/stemmer": "0512",
    "rluiten/sparsevector": "0513",
    "dvberkel/microkanren": "0514",
    "getto-systems/elm-apply": "0515",
    "getto-systems/elm-field": "0516",
    "getto-systems/elm-html-table": "0517",
    "getto-systems/elm-http-part": "0518",
    "getto-systems/elm-http-header": "0519",
    "getto-systems/elm-url": "0520",
    "getto-systems/elm-json": "0521",
    "getto-systems/elm-sort": "0522",
    "getto-systems/elm-command": "0523",
    "anhmiuhv/pannablevideo": "0524",
    "harmboschloo/elm-dict-intersect": "0525",
    "bowbahdoe/elm-history": "0526",
    "TSFoster/elm-md5": "0527",
    "Spaxe/elm-lsystem": "0528",
    "AuricSystemsInternational/creditcard-validator": "0529",
    "alex-tan/postgrest-queries": "0530",
    "TSFoster/elm-bytes-extra": "0531",
    "eelcoh/parser-indent": "0532",
    "benansell/lobo-elm-test-extra": "0533",
    "fifth-postulate/combinatorics": "0534",
    "miyamoen/elm-command-pallet": "0535",
    "melon-love/elm-gab-api": "0536",
    "abradley2/form-elements": "0537",
    "billstclair/elm-crypto-aes": "0538",
    "arowM/elm-css-modules-helper": "0539",
    "iodevs/elm-history": "0540",
    "ymtszw/elm-broker": "0541",
    "ThinkAlexandria/elm-primer-tooltips": "0542",
    "ryan-senn/elm-compiler-error-sscce": "0543",
    "genthaler/elm-enum": "0544",
    "bigbinary/elm-reader": "0545",
    "bigbinary/elm-form-field": "0546",
    "ryry0/elm-numeric": "0547",
    "bburdette/typed-collections": "0548",
    "r-k-b/map-accumulate": "0549",
    "arnau/elm-objecthash": "0550",
    "emptyflash/typed-svg": "0551",
    "the-sett/svg-text-fonts": "0552",
    "billstclair/elm-chat": "0553",
    "Libbum/elm-partition": "0554",
    "turboMaCk/elm-continue": "0555",
    "imjoehaines/afinn-165-elm": "0556",
    "lazamar/dict-parser": "0557",
    "arowM/elm-html-extra-internal": "0558",
    "arowM/elm-html-internal": "0559",
    "Janiczek/architecture-test": "0560",
    "truqu/elm-dictset": "0561",
    "NoRedInk/http-upgrade-shim": "0562",
    "miyamoen/tree-with-zipper": "0563",
    "NoRedInk/elm-saved": "0564",
    "NoRedInk/elm-rfc5988-parser": "0565",
    "rtfeldman/count": "0566",
    "NoRedInk/elm-debug-controls-without-datepicker": "0567",
    "NoRedInk/elm-formatted-text-test-helpers": "0568",
    "NoRedInk/elm-formatted-text-19": "0569",
    "NoRedInk/elm-plot-rouge": "0570",
    "NoRedInk/elm-rails": "0571",
    "NoRedInk/elm-sweet-poll": "0572",
    "NoRedInk/elm-rollbar": "0573",
    "avh4/burndown-charts": "0574",
    "justinmimbs/tzif": "0575",
    "avh4/elm-github-v3": "0576",
    "the-sett/elm-one-many": "0577",
    "ianmackenzie/elm-iso-10303": "0578",
    "ianmackenzie/elm-step-file": "0579",
    "folkertdev/elm-kmeans": "0580",
    "folkertdev/elm-iris": "0580",
    "ianmackenzie/elm-geometry-prerelease": "0581",
    "lukewestby/accessible-html-with-css-temp-19": "0582",
    "folkertdev/elm-brotli": "0583",
    "lukewestby/http-extra": "0584",
    "the-sett/elm-enum": "0585",
    "the-sett/elm-aws-cognito": "0585",
    "the-sett/elm-auth": "0585",
    "the-sett/elm-auth-aws": "0585",
    "Janiczek/elm-bidict": "0586",
    "Janiczek/elm-runescape": "0587",
    "Janiczek/browser-extra": "0588",
    "folkertdev/elm-tiny-inflate": "0589",
    "Fresheyeball/deburr": "0590",
    "Skinney/elm-deque": "0591",
    "Skinney/elm-phone-numbers": "0592",
    "billstclair/elm-geolocation": "0593",
    "billstclair/elm-dev-random": "0594",
    "jinjor/elm-map-debug": "0595",
    "jinjor/elm-req": "0596",
    "the-sett/auth-elm": "0597",
    "the-sett/tea-tree": "0598",
    "jweir/charter": "0599",
    "jinjor/elm-insertable-key": "0600",
    "Chadtech/dependent-text": "0601",
    "zwilias/elm-holey-zipper": "0602",
    "Chadtech/elm-imperative-porting": "0603",
    "Chadtech/elm-provider": "0604",
    "Chadtech/elm-us-state-abbreviations": "0605",
    "turboMaCk/glue": "0606",
    "simonh1000/elm-sliding-menus": "0607",
    "Gizra/elm-editable-webdata": "0608",
    "TSFoster/elm-envfile": "0609",
    "Gizra/elm-storage-key": "0610",
    "ccapndave/elm-eexl": "0611",
    "ccapndave/elm-typed-tree": "0612",
    "arowM/elm-data-url": "0613",
    "ccapndave/elm-translator": "0614",
    "ccapndave/elm-statecharts": "0615",
    "TSFoster/elm-compare": "0616",
    "arowM/elm-html-with-context": "0617",
    "miniBill/date-format-languages": "0618",
    "arowM/elm-parser-test": "0619",
    "Zinggi/elm-glsl-generator": "0620",
    "toastal/mailto": "0621",
    "toastal/endo": "0622",
    "FabienHenon/remote-resource": "0623",
    "carwow/elm-slider-old": "0624",
    "lynn/elm-ordinal": "0625",
    "alex-tan/task-extra": "0626",
    "norpan/elm-json-patch": "0627",
    "ChristophP/elm-mark": "0628",
    "ericgj/elm-uri-template": "0628",
    "jxxcarlson/elm-stat": "0629",
    "stoeffel/resetable": "0630",
    "ktonon/elm-jsonwebtoken": "0631",
    "justgook/alt-linear-algebra": "0632",
    "waratuman/elm-json-extra": "0633",
    "GlobalWebIndex/quantify": "0634",
    "andre-dietrich/elm-mapbox": "0635",
    "jfmengels/elm-review-reporter": "0636",
    "frandibar/elm-bootstrap": "0637",
    "basti1302/elm-non-empty-array": "0638",
    "rluiten/mailcheck": "0639",
    "abadi199/intl-phone-input": "0640",
    "GlobalWebIndex/class-namespaces": "0641",
    "justgook/elm-game-logic": "0642",
    "alex-tan/loadable": "0643",
    "joshforisha/elm-inflect": "0644",
    "FabienHenon/elm-ckeditor5": "0645",
    "FabienHenon/elm-iso8601-date-strings": "0646",
    "gicentre/tidy": "0647",
    "drathier/elm-test-graph": "0648",
    "sporto/elm-countries": "0649",
    "sporto/polylinear-scale": "0650",
    "ggb/porterstemmer": "0651",
    "ggb/elm-bloom": "0652",
    "ggb/elm-trend": "0653",
    "ggb/elm-sentiment": "0654",
    "ThinkAlexandria/elm-html-in-elm": "0655",
    "allo-media/elm-es-simple-query-string": "0656",
    "allo-media/elm-daterange-picker": "0657",
    "ThinkAlexandria/window-manager": "0658",
    "ericgj/elm-validation": "0659",
    "driebit/elm-ginger": "0660",
    "1602/json-schema": "0661",
    "pilatch/elm-chess": "0662",
    "achutkiran/elm-material-color": "0663",
    "mthadley/elm-typewriter": "0664",
    "peterszerzo/elm-json-tree-view": "0665",
    "z5h/jaro-winkler": "0666",
    "z5h/zipper": "0666",
    "harrysarson/elm-decode-elmi": "0667",
    "justgook/elm-webdriver": "0668",
    "Herteby/url-builder-plus": "0669",
    "tricycle/elm-email": "0670",
    "tricycle/elm-infinite-gallery": "0671",
    "tricycle/system-actor-model": "0672",
    "tricycle/elm-imgix": "0673",
    "tricycle/elm-infnite-gallery": "0674",
    "owanturist/elm-queue": "0675",
    "owanturist/elm-avl-dict": "0675",
    "kirchner/form-validation": "0676",
    "tricycle/elm-eventstream": "0677",
    "prozacchiwawa/elm-json-codec": "0678",
    "pd-andy/elm-audio-graph": "0679",
    "abradley2/form-fields": "0680",
    "harrysarson/elm-hacky-unique": "0681",
    "allo-media/fable": "0682",
    "abradley2/form-controls": "0683",
    "dosarf/elm-activemq": "0684",
    "marshallformula/arrangeable-list": "0685",
    "peterszerzo/elm-natural-ui": "0686",
    "indicatrix/elm-chartjs-webcomponent": "0687",
    "abinayasudhir/elm-treeview": "0688",
    "laserpants/elm-burrito-update": "0688",
    "abinayasudhir/elm-select": "0688",
    "ljuglaret/combinatoire": "0688",
    "PaackEng/elm-ui-dropdown": "0688",
    "MartinSStewart/elm-nonempty-string": "0688",
    "jouderianjr/elm-loaders": "0688",
    "proda-ai/elm-logger": "0688",
    "PaackEng/elm-google-maps": "0688",
    "YuyaAizawa/peg": "0688",
    "MartinSStewart/elm-bayer-matrix": "0688",
    "tricycle/morty-api": "0689",
    "proda-ai/formatting": "0690",
    "proda-ai/elm-svg-loader": "0691",
    "ymtszw/elm-http-xml": "0692",
    "bburdette/stl": "0693",
    "arsduo/elm-ui-drag-drop": "0694",
    "PaackEng/elm-ui-dialog": "0695",
    "owanturist/elm-graphql": "0696",
    "thought2/elm-wikimedia-commons": "0697",
    "getto-systems/getto-elm-command": "0698",
    "showell/elm-data-util": "0699",
    "PaackEng/elm-alert-beta": "0700",
    "jjant/elm-dict": "0701",
    "alexanderkiel/list-selection": "0702",
    "JohnBugner/elm-loop": "0703",
    "abinayasudhir/outmessage": "0704",
    "jjant/elm-comonad-zipper": "0705",
    "jaredramirez/elm-field": "0706",
    "vViktorPL/elm-incremental-list": "0707",
    "ronanyeah/calendar-dates": "0708",
    "bowbahdoe/lime-reset": "0708",
    "dasch/levenshtein": "0709",
    "commonmind/elm-csv-encode": "0710",
    "dasch/parser": "0711",
    "maca/crdt-replicated-graph": "0712",
    "r-k-b/elm-interval": "0713",
    "harmboschloo/graphql-to-elm-package": "0714",
    "harmboschloo/elm-ecs": "0715",
    "wolfadex/tiler": "0716",
    "iodevs/elm-validate": "0717",
    "Libbum/elm-redblacktrees": "0718",
    "r-k-b/complex": "0719",
    "ryan-senn/stellar-elm-sdk": "0720",
};
exports.default = RANKING_LIST;
//# sourceMappingURL=ranking.js.map