// Global variables
let accomp = [];
let timerSeconds = 1500; // 25 minutes default
let timerInterval;
let isPaused = false;
let isLoop = false;
let isDarkTheme = false;

const defaultSources = [
    'https://cdn.pixabay.com/audio/2024/07/31/audio_ca7b04c1bd.mp3',
    'https://cdn.uppbeat.io/audio-files/bd8b8d896868ba0f13070ce660e33d5e/d93ef703791aac925d15efcfe1d91999/59d54f73347de37fe034ad6e791c3446/STREAMING-fluff-qube-main-version-23976-01-55.mp3',
    'https://cdn.uppbeat.io/audio-files/08653f6c4e0880f1e134bb2d18e7aa90/3a21fd662f93765b0a767e3a4474868c/e3adfc34b28a48a103719b25d11a4a0e/STREAMING-nu-day-kem-main-version-16727-05-05.mp3',
    'https://cdn.uppbeat.io/audio-files/fd6f99da8569b8fae0e89b28891fc96a/aa8ef77b52cc5a658cee3f942b709c31/3ff37795df4cb998661c4d999ba28147/STREAMING-cold-brew-ra-main-version-29719-02-38.mp3',
    'https://cdn.uppbeat.io/audio-files/feb0842d36ded48702cb4038d4bc3c09/9a9a9962343b6d9b4f3ba7ec6bae73bd/8ae423fc62a429eb68ebb995cbea7256/STREAMING-malibop-lloom-main-version-25577-03-18.mp3',
    'https://cdn.uppbeat.io/audio-files/6dc9bc42bb6db2adb9da948c6d4cc319/2dcaae85d7d918f5bafdb5d64f9b46b1/96e779b9cdbd33944c95b64bd8244cd2/STREAMING-lonely-nights-yasumu-main-version-22495-02-12.mp3',
    'https://cdn.uppbeat.io/audio-output/294/2384/main-version/streaming-previews/STREAMING-autumn-coffee-bosnow-main-version-02-16-8826.mp3',
    'https://cdn.uppbeat.io/audio-files/d698e5b0e6235427c770929d50b27956/bb0b79902fa8b55a24297320841e8756/561f937b498f4936175671c711c43708/STREAMING-straight-chillin-braden-deal-main-version-26107-02-44.mp3',
    'https://cdn.uppbeat.io/audio-files/95efc2c018c6c8d9e52ae87eb7af0395/5902e72d996e782018052268f98fc1c0/81e4f493a115ada138ff572cdd7590fb/STREAMING-midnight-glow-wooll-main-version-27378-02-40.mp3',
    'https://cdn.uppbeat.io/audio-files/77c5e386047fdaa2fcd9971748957c4a/e0520c207248eb4b9ef9903ee92b58bf/420b276b5719c394fcafe0d0e321f70e/STREAMING-second-stop-cafe-auv-main-version-32211-02-34.mp3',
    'https://cdn.uppbeat.io/audio-files/37f2dfeadea4a411cc6393845b6fb27d/c3e69905621dd45b29cb3f1a425d3006/95a2f61449548a76cfa2ac1b32be3c9b/STREAMING-moonlight-kidcut-main-version-17773-02-31.mp3',
    'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/49831497be2da9408ae30a0bf4980a61/5213bc56fcaad0629cea1ad734c79b01/STREAMING-aurora-mum-child-main-version-17287-02-00.mp3',
    'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/a777e8c8ce8f57dde9f4804aad6e8d56/29ea10cf12e16c49061e291ed999729b/STREAMING-sleeping-our-noons-away-mum-child-main-version-17274-02-05.mp3',
    'https://cdn.uppbeat.io/audio-files/46731dd22c02a7edc7c194026cc94ae7/2cf03956ec654db8213f14ccaa86635c/593d9b5c48cb05588210eec5152ad584/STREAMING-levitating-indoors-yawnathan-main-version-28205-02-31.mp3',
    'https://cdn.uppbeat.io/audio-files/4e7077eceba732f66703a46ca4df3c09/9ce76d6e17f6766516f41341a87b021d/29784ef530c6f144ccd8a814ecc6dd00/STREAMING-leaving-the-city-mum-child-main-version-17305-02-25.mp3',,
    'https://cdn.uppbeat.io/audio-files/9fea0ae6cc0c520f6b25e8c40681e539/8ea714519bc0db57778367e7ced03193/859d311171e4c1bc8dde64726ed73bc5/STREAMING-blue-was-brightest-haquin-main-version-16924-02-12.mp3'
];

const ghibliInspiredSources = [
    'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/6ac5b00245391cef7605fe3abb5db5be/161f25f0ee547beff777a77096be30bb/STREAMING-adrift-theo-gerard-main-version-25168-02-17.mp3',
    'https://cdn.uppbeat.io/audio-files/7ca00d8b9e9088256e127670a0c823d2/b0ad7139aec2e38ef51522b1388288f7/856daa4ca00c049af8208d10e96a8238/STREAMING-elegy-of-the-heartstrings-studiokolomna-main-version-28963-02-04.mp3',
    'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/2a82d95631c9e965831d48e9ae0d3e3e/a71ec0123bccee5d6cf5e9800675b245/STREAMING-this-time-around-oliver-massa-main-version-13816-01-33.mp3',
    'https://cdn.uppbeat.io/audio-files/48c197ea701573c6a391cd76382175f7/89ec339b32a6a14bd25b978ce40b40f0/16f3bec4ca0f35d3c1564525e012cfe6/STREAMING-joie-de-vivre-albert-behar-main-version-17795-02-22.mp3',
    'https://cdn.uppbeat.io/audio-files/859609878169b59906409378a56d244d/f9ef592e8ad0e03f53a820bace4e4b60/c687daa54ef9ff2a671e08b887e16fb9/STREAMING-adventure-theme-aaron-paul-low-main-version-25195-02-28.mp3',
    'https://cdn.uppbeat.io/audio-files/ecb87cac8317887235872504e3bce04e/0b794230248a6277f702c8c20c643987/20dbb22a464080391991cda9f05fe970/STREAMING-kunisaki-jonathan-doherty-main-version-24768-03-55.mp3',
    'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/74c4add261bd76c05de6192370545e70/c127f5e159acfc445aacc6fb9a0bdc04/STREAMING-all-good-things-oliver-massa-main-version-21725-03-38.mp3',
    'https://cdn.uppbeat.io/audio-files/0e5573c69208594d8a7e799df2ff2bcc/92fc526b2427072d2a86c86f86e8dffb/99c36d46509f541231ad954617ce94f8/STREAMING-through-time-simon-folwar-main-version-33545-02-29.mp3',
    'https://cdn.uppbeat.io/audio-files/6acf0e1e998166efd11dea1a992a0780/d26746f5f7e81ef1319f0b352f76c8fb/7a10ab538ce0b4166da3bc092d38c6b6/STREAMING-memories-jonny-easton-main-version-17339-03-22.mp3',
    'https://cdn.uppbeat.io/audio-files/48c197ea701573c6a391cd76382175f7/749fd48e6ee93048c20c85fa580d6b1d/cd345e82b41c1eec7d3faf25a0e9a184/STREAMING-secret-garden-albert-behar-main-version-21829-01-06.mp3',
    'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/21ee7e1ce15a3471604385a415aa29ff/b13102f2c09cfb1c712df78968b0060a/STREAMING-hundred-n-seven-ian-aisling-main-version-27022-02-56.mp3',
    'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/703b9cc3d85649917a1e57a22eec4b37/b901a2e5716836d21f775c70f6438562/STREAMING-impressionist-theo-gerard-main-version-25167-00-47.mp3',
    'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/5f19013b4aa070ac0179f22001c4ce40/e4991a959dfe88ba34ab57c521da2086/STREAMING-empty-moon-ian-aisling-main-version-24985-03-59.mp3',
    'https://cdn.uppbeat.io/audio-files/a0cc5e822231d61becc96360f5e653b5/530b64bece37f9728003147f41aa918a/5a8a907ef0e4957ce6f4778a3e2ffe2c/STREAMING-old-street-ilya-kuznetsov-main-version-31500-02-41.mp3',
    'https://cdn.uppbeat.io/audio-files/0e600bf393a5e1e897e195e258525c7a/9f576e52a1bae98c227e208bcfc72eda/b626f8c8253c5335bf727665e51cff93/STREAMING-dancing-on-top-of-clouds-morning-mist-main-version-23748-02-24.mp3',
    'https://cdn.uppbeat.io/audio-files/c4e5b95268bf111c59d7d9649ed5bd7d/382dfa142e310fe45908c1342ab327d5/54b7b7ddef3d2d7644f7cedd3f90b249/STREAMING-pure-elegance-theo-gerard-main-version-25156-00-49.mp3',
    'https://cdn.uppbeat.io/audio-files/be2a92d868444c66d14d59801a67ce1e/d4f51dbff238ea13282d9d324ad160eb/fa8778cb559976d40f7cce96ff541e6c/STREAMING-une-petite-promenade-jacob-armerding-main-version-23448-03-34.mp3',
    'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/1bab071969b3d392fb924934291edb17/5a3b967ea47294a71d6f263f7f414521/STREAMING-glimpse-of-euphoria-ian-aisling-main-version-24763-01-39.mp3',
    'https://cdn.uppbeat.io/audio-files/d86b5dc87412daa6133085b96040752d/42a807b6239424d2b571513731c0bc27/f81a2e192547a9465b3ed03ce8cd556b/STREAMING-gardenia-ian-aisling-main-version-24762-02-26.mp3'
];

const lazyLofiSources = [
    'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/489ebd7efd2c5d966ef63c0c0a1f89f2/8abb2d49069f14e2d1609e244bbd9709/STREAMING-waves-alexander-plam-main-version-16612-02-14.mp3',
    'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/4c4d88cc2695b6351065555eebc0dc54/f76b213826c2b9e4c6d04e0bb8bd693e/STREAMING-flutter-alexander-plam-main-version-16615-01-48.mp3',
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/73d70ecc8e926f8641b2e67524a794ae/c1bf0eaa535fa647814dfab584435744/STREAMING-your-love-is-what-i-need-soundroll-main-version-12292-03-37.mp3',
    'https://cdn.uppbeat.io/audio-files/d9a4509e97bb95458a102098b25d49ab/6bd1a9977c427d6c5fda607a1b60f38e/72a8770e0bdf43299d044633b76d4008/STREAMING-late-night-yokonap-main-version-21262-02-32.mp3',
    'https://cdn.uppbeat.io/audio-files/f54ab6f74b5438a7286ea064f94b7d81/682580d811727bd2d4e8e06e77173e1f/1be0b246b40e631f1396886ccf1e73de/STREAMING-sunny-morning-avbe-main-version-18772-03-29.mp3',
    'https://cdn.uppbeat.io/audio-files/9fea0ae6cc0c520f6b25e8c40681e539/e1a24a54815caffe770dbeee2e670ef5/168eb3eae2984621a126bd2ede3edb64/STREAMING-slumber-haquin-main-version-16915-01-59.mp3',
    'https://cdn.uppbeat.io/audio-files/46731dd22c02a7edc7c194026cc94ae7/41dad85985a7d1cfe51c356d3acac7bc/e593b1697e0477b257be83584a24e440/STREAMING-weightless-evening-yawnathan-main-version-25835-03-04.mp3',
    'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/c5484a7ff8e9e5cf576f8c82ab4268e3/54964c5d42384263e9e62c00a997213f/STREAMING-satie-oliver-massa-main-version-13820-02-42.mp3',
    'https://cdn.uppbeat.io/audio-files/9522211dcb40a5f6f421199a416268d2/ac9dd2e8e267dfe43aee49ab9dfb0773/81c385ad61259ae94b203bd2245c47b7/STREAMING-slowly-alexander-plam-main-version-16614-03-40.mp3',
    'https://cdn.uppbeat.io/audio-files/b0a759f14be8e2cb5831ec764ec690dc/6a051ddb9bbb47994534bd4752914dea/3b8ac97d9ca4a47ddc44d6bdcdfd617c/STREAMING-black-coffee-all-good-folks-main-version-3878-01-19.mp3'
];

const lofiChillSources = [
    'https://cdn.uppbeat.io/audio-files/b959962d120516577fa4ce048c890ca8/5d14eca80d62ec5b1fdb44a77b02578b/55ae2dc9ff76c55af94bc4125b34497e/STREAMING-music-is-pryces-main-version-3083-02-54.mp3', 
    'https://cdn.uppbeat.io/audio-files/46731dd22c02a7edc7c194026cc94ae7/b75dfe6ceb9f328d103cf87f90d620e0/b5e3126f614c0a69425e0d0125d6d3d1/STREAMING-orimasu-yawnathan-main-version-25832-02-37.mp3', 
    'https://cdn.uppbeat.io/audio-files/08653f6c4e0880f1e134bb2d18e7aa90/cf14706d7ffb3dd7401082ca0f3db081/275f31379cddca04fcf0c47fbed5acd7/STREAMING-lazy-love-kem-main-version-16052-02-52.mp3', 
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/784347127d73c8e03ef02926a2a935dd/28b79e5e351d8b4883fa17cf798fdc76/STREAMING-poem-soundroll-main-version-4328-02-33.mp3', 
    'https://cdn.uppbeat.io/audio-files/17f6e3f49a9738f4803e32bebb606b30/5365ac97ea3dbe537344bafb08d92ddb/2fbdb83947e8097559fded152465fc0e/STREAMING-lost-in-you-abbynoise-main-version-27455-02-16.mp3', 
    'https://cdn.uppbeat.io/audio-files/c636d7c86452449b1203fc0bded83e29/16e5aa11c7c6ccdaaeb225b6afbe9bbb/0086e067b499cc14cd4ff5ce89ee464e/STREAMING-brunch-cafe-matrika-main-version-24053-02-56.mp3', 
    'https://cdn.uppbeat.io/audio-files/6fe37c64db62e03d698e462645fa35a7/77d0931e10190e0fd9d487b96fbd9429/f57fa77f7b77efa204ee7a95dbef317c/STREAMING-vlog-king-pecan-pie-main-version-20269-02-57.mp3', 
    'https://cdn.uppbeat.io/audio-files/08653f6c4e0880f1e134bb2d18e7aa90/3a21fd662f93765b0a767e3a4474868c/e3adfc34b28a48a103719b25d11a4a0e/STREAMING-nu-day-kem-main-version-16727-05-05.mp3', 
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/d58cf3731e1a874cc1f79896398ccebb/549f81b52309ed463c7d538c1efc6fe5/STREAMING-all-the-things-you-love-soundroll-main-version-1738-03-15.mp3', 
    'https://cdn.uppbeat.io/audio-files/b2810913f88b72f580ee1f44ab4ef849/940b59d02223fa8abef4d338f3a14daf/e4c6d7256366228380569f798e61841b/STREAMING-the-cleaner-night-drift-main-version-20732-02-01.mp3'
];

const jazzBeatsSources = [
    'https://cdn.uppbeat.io/audio-files/b2810913f88b72f580ee1f44ab4ef849/940b59d02223fa8abef4d338f3a14daf/e4c6d7256366228380569f798e61841b/STREAMING-the-cleaner-night-drift-main-version-20732-02-01.mp3',
    'https://cdn.uppbeat.io/audio-files/f54ab6f74b5438a7286ea064f94b7d81/b3458dde536036058adf524695903273/25296df70fc4614a01d30e3aa9a5e069/STREAMING-espresso-beans-avbe-main-version-21670-02-03.mp3',
    'https://cdn.uppbeat.io/audio-files/8a6e5cc971b8ec9e3a0db60d88c398b8/296a6e5139ff153f2bc2792d3ee9e927/03d1c6d689c47c93cf92ed1609282177/STREAMING-the-waves-otto-mp3-main-version-33266-03-45.mp3',
    'https://cdn.uppbeat.io/audio-files/6fe37c64db62e03d698e462645fa35a7/91d0d26bb854cad461eec27c72dfc38e/fdf9ef68a39353e535ed41c675ff97a6/STREAMING-important-to-you-pecan-pie-main-version-18025-02-06.mp3',
    'https://cdn.uppbeat.io/audio-files/fe1a3946416d48e045a9e3d5d95f085f/452a78b997a42bf551875bb134bae392/3f70536926656236c7c13310c2fbf857/STREAMING-minnie-sega-williams-main-version-16584-01-52.mp3',
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/d58cf3731e1a874cc1f79896398ccebb/549f81b52309ed463c7d538c1efc6fe5/STREAMING-all-the-things-you-love-soundroll-main-version-1738-03-15.mp3',
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/784347127d73c8e03ef02926a2a935dd/28b79e5e351d8b4883fa17cf798fdc76/STREAMING-poem-soundroll-main-version-4328-02-33.mp3',
    'https://cdn.uppbeat.io/audio-files/f54ab6f74b5438a7286ea064f94b7d81/fc904ea06be63acc5f0d85a66a24157f/71cd51cdad4b207777e532269bb98b5f/STREAMING-that-70-s-diner-avbe-main-version-26388-02-12.mp3',
    'https://cdn.uppbeat.io/audio-files/37f2dfeadea4a411cc6393845b6fb27d/dd7786b2775a5a43076f90d670860fe6/35d8fd2262b5960f0fc530109d03f553/STREAMING-jazzy-cookies-kidcut-main-version-5899-02-05.mp3',
    'https://cdn.uppbeat.io/audio-files/6fe37c64db62e03d698e462645fa35a7/86905b62d2f270d7a543f974d32de25d/37f18dd9d437afe2b582d6471b7b783f/STREAMING-evening-kisses-pecan-pie-main-version-18704-02-23.mp3',
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/57ea6d3737280f9d490427f5a43e073e/2b8768626abce8412de5d6d2a46e014d/STREAMING-forgotten-soundroll-main-version-1719-02-17.mp3',
    'https://cdn.uppbeat.io/audio-files/dac84562981116a10a7a4f4ebcf5a446/f37d3cba59e927257c17d9c58e568b12/e84e28df2bac3a8896d05be39d218b9a/STREAMING-in-the-now-cruen-main-version-5363-01-09.mp3',
    'https://cdn.uppbeat.io/audio-files/b2810913f88b72f580ee1f44ab4ef849/d24180afba0db03fe05c3b5d5c70ada0/98f4931afc4ce77657e809f5b6b325ae/STREAMING-panama-night-drift-main-version-23966-01-39.mp3',
    'https://cdn.uppbeat.io/audio-files/b90989c8ba0b62e8eb948123e09825ac/747866cf2717b6dd9d1962ce0cfee320/e8ea4e0f7dde8beb0133570f6627ea43/STREAMING-paris-coffee-shop-nicolas-kluzek-main-version-25893-01-45.mp3'
];

const sadSources = [
    'https://cdn.uppbeat.io/audio-files/5dfbc12f82c94629f611d67857f9856a/6ea267625fac41a61b8fdd35a5b9cbce/c6e602fae2c1f92901c231a5deddd48b/STREAMING-living-waters-brock-hewitt-stories-in-sound-main-version-16300-04-26.mp3',
    'https://cdn.uppbeat.io/audio-output/470/1860/main-version/streaming-previews/STREAMING-caravan-arend-main-version-03-02-6593.mp3',
    'https://cdn.uppbeat.io/audio-output/255/3706/main-version/streaming-previews/STREAMING-washed-brock-hewitt-stories-in-sound-main-version-03-45-13831.mp3',
    'https://cdn.uppbeat.io/audio-output/5/274/main-version/streaming-previews/STREAMING-love-and-sorrow-ak-main-version-02-03-1319.mp3',
    'https://cdn.uppbeat.io/audio-output/22/2779/main-version/streaming-previews/STREAMING-making-progress-dan-phillipson-main-version-02-56-10491.mp3',
    'https://cdn.uppbeat.io/audio-output/255/2582/main-version/streaming-previews/STREAMING-watching-the-waves-brock-hewitt-stories-in-sound-main-version-02-53-9714.mp3',
    'https://cdn.uppbeat.io/audio-output/534/3365/main-version/streaming-previews/STREAMING-the-wound-between-us-cory-alstad-main-version-02-40-12696.mp3',
    'https://cdn.uppbeat.io/audio-output/255/2575/main-version/streaming-previews/STREAMING-in-the-silence-brock-hewitt-stories-in-sound-main-version-03-42-9707.mp3',
    'https://cdn.uppbeat.io/audio-output/470/2905/main-version/streaming-previews/STREAMING-solstice-i-arend-main-version-03-50-10925.mp3',
    'https://cdn.uppbeat.io/audio-files/764020966407166bfd6ce54e8948466e/acc715d5976171e4f09bd91edf25848f/5e1448fc4172cde7a1247fa207ee33c0/STREAMING-lost-in-time-aylex-main-version-21983-02-05.mp3',
    'https://cdn.uppbeat.io/audio-output/470/1863/main-version/streaming-previews/STREAMING-lament-arend-main-version-03-19-6615.mp3',
    'https://cdn.uppbeat.io/audio-files/e98a11e9b1c19795f4c5a2952ad4ad27/3cb36e310a056d55cf27928073309929/a4ef4a7b8367b246363ef1de854db827/STREAMING-notes-from-the-past-monument-music-main-version-5991-01-30.mp3',
    'https://cdn.uppbeat.io/audio-files/7d3fe3366ff4f59880ca3f2f8996ed50/99933bf355b40c05d81b5a396fa01581/98105fdc608d9fc013ecceab766700df/STREAMING-yearning-heart-infraction-main-version-15051-02-35.mp3',
    'https://cdn.uppbeat.io/audio-output/255/1166/main-version/streaming-previews/STREAMING-through-darkness-brock-hewitt-stories-in-sound-main-version-02-52-3864.mp3',
    'https://cdn.uppbeat.io/audio-files/1681cd49bc5562538e7d2edc7340ad00/1e9c4f222579269f9a9892089fbd6491/5a20ce7dbccac6f74eb279e5f1df046a/STREAMING-broken-david-bullard-main-version-23802-01-49.mp3',
    'https://cdn.uppbeat.io/audio-output/82/1027/main-version/streaming-previews/STREAMING-clouds-northwestern-main-version-01-31-3505.mp3',
    'https://cdn.uppbeat.io/audio-files/7ca00d8b9e9088256e127670a0c823d2/193bc7f5b06b0f88df9d0eddbd3ccbc0/0dee9b9b9294dd8bb21207be0b9e5784/STREAMING-abyss-walker-studiokolomna-main-version-30002-02-00.mp3',
    'https://cdn.uppbeat.io/audio-output/124/817/main-version/streaming-previews/STREAMING-turn-away-yeti-music-main-version-01-00-3022.mp3',
    'https://cdn.uppbeat.io/audio-files/ecd6f52a756aed265e635c6c3562818a/76d22d7252e49083d2ac1acec416d309/627a50cfd0a9a34be21260e831effdc3/STREAMING-without-you-sonda-main-version-23922-02-52.mp3',
    'https://cdn.uppbeat.io/audio-output/304/1223/main-version/streaming-previews/STREAMING-sight-ilya-kuznetsov-main-version-03-25-3941.mp3'
];

const goodVibeSources = [
    'https://cdn.uppbeat.io/audio-output/330/201/main-version/streaming-previews/STREAMING-trendsetter-mood-maze-main-version-02-53-1004.mp3',
    'https://cdn.uppbeat.io/audio-files/f7a17930b3ac8c8070a94a121bce181c/74ed4ae87d0bfba11a689fb424928cdc/ba58f01a66b005bbaa3f9dccabfc4dda/STREAMING-seize-the-day-andrey-rossi-main-version-14571-01-40.mp3',
    'https://cdn.uppbeat.io/audio-output/345/6616/main-version/streaming-previews/STREAMING-funk-in-the-trunk-trinity-main-version-02-26-19677.mp3',
    'https://cdn.uppbeat.io/audio-files/ecd6f52a756aed265e635c6c3562818a/c180600b1e0633eb33ebc94f5c6e3c85/97eea5a88eab448b80ea87c141b1a071/STREAMING-fridays-sonda-main-version-22636-02-05.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/b2000757b2d6a2e733a33b1cd078fd5d/18f4b2345f098fd944e4a93d7d596582/STREAMING-paradise-island-hartzmann-main-version-13205-03-07.mp3',
    'https://cdn.uppbeat.io/audio-output/392/3520/main-version/streaming-previews/STREAMING-sweet-dreams-ra-main-version-02-10-13182.mp3',
    'https://cdn.uppbeat.io/audio-output/392/3600/main-version/streaming-previews/STREAMING-let-good-times-roll-ra-main-version-02-57-13553.mp3',
    'https://cdn.uppbeat.io/audio-files/0e5573c69208594d8a7e799df2ff2bcc/312cc6f2d6f06854f3ba6382e79273b2/89bdfc2e6a0ebde0648d648a2982ebf8/STREAMING-in-the-sun-simon-folwar-main-version-17400-02-33.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/d547165c2d1dd8d1d9768ddf28a5dacb/e78138cf5f3fb849af7361967b4912f5/STREAMING-clear-sky-hartzmann-main-version-5299-02-20.mp3',
    'https://cdn.uppbeat.io/audio-output/346/217/main-version/streaming-previews/STREAMING-follow-your-heart-atm-main-version-02-32-1090.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/71af7d87a4be5c114d3e2a0ec339068c/35739a1ed60925a65d77b68c8968a333/STREAMING-no-sugar-please-hartzmann-main-version-18190-02-28.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/91c31c31bc5d370834e0dd90430346b7/5162d36c7ebdff6430290d614b5b27e9/STREAMING-love-machine-hartzmann-main-version-17902-02-31.mp3',
    'https://cdn.uppbeat.io/audio-files/fd6f99da8569b8fae0e89b28891fc96a/1c3c78a928a92dfd88def41226c04f96/6f96fc3d1b259cc729c3ae7b394b8944/STREAMING-upbeat-heat-ra-main-version-19082-02-16.mp3',
    'https://cdn.uppbeat.io/audio-files/976c5cd0422903916639fdd87df459b7/4623035aec7285417e80f3c597a46072/d6f49331d95bd22f7449a6b2fe216aa0/STREAMING-heatwave-hey-pluto-main-version-5777-02-22.mp3',
    'https://cdn.uppbeat.io/audio-output/346/220/main-version/streaming-previews/STREAMING-i-feel-you-atm-main-version-02-42-1108.mp3',
    'https://cdn.uppbeat.io/audio-files/fabca43253b27cfd78217d5cd423028e/0acdf55a5259769890d6476501560ec5/9dd01fd1842bc26b506f153dff36ce4c/STREAMING-at-the-hotel-paul-yudin-main-version-12271-02-36.mp3',
    'https://cdn.uppbeat.io/audio-files/3159011fed399f2fd1cddccf6d2c4b80/889eff4ff19ba78bf99f3b84c83e69a6/2f35e3b8a86c58bbda503662d80a8e5f/STREAMING-searching-danger-lion-x-main-version-15846-02-44.mp3',
    'https://cdn.uppbeat.io/audio-files/fabca43253b27cfd78217d5cd423028e/a90ed335ac13a1dce6519364247d4030/e809f54e9df572f851874e4afb8d715d/STREAMING-summer-bumble-paul-yudin-main-version-18169-02-16.mp3',
    'https://cdn.uppbeat.io/audio-output/455/6389/main-version/streaming-previews/STREAMING-some-kind-of-feelin-ben-johnson-main-version-03-53-18655.mp3',
    'https://cdn.uppbeat.io/audio-files/bf4a6c1411782684a48e0896370f8fb9/2e86d1ec8673d839d4415e96ff0c6e57/731ccca925e8ef79b220c1e31cc3a4fa/STREAMING-check-it-out-mountaineer-main-version-782-02-04.mp3'
];

const timelapseSources = [
    'https://cdn.uppbeat.io/audio-output/161/1783/main-version/streaming-previews/STREAMING-aspire-all-good-folks-main-version-02-18-6252.mp3',
    'https://cdn.uppbeat.io/audio-files/1eaed6f18d69074e114db529f2bd7e46/899451f6b072faaabf214412b89e8ce4/d5dfc5a9172ba2d887b49b9902bb15e2/STREAMING-transcend-soundroll-main-version-1756-02-38.mp3',
    'https://cdn.uppbeat.io/audio-output/539/3722/main-version/streaming-previews/STREAMING-miracle-qube-main-version-01-44-13858.mp3',
    'https://cdn.uppbeat.io/audio-output/330/200/main-version/streaming-previews/STREAMING-nightdrive-mood-maze-main-version-02-46-1001.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/d4acb1782745883e286f96f07aa9ad72/ab15f9a5177b21936afa026e466ecfe1/STREAMING-good-feelings-hartzmann-main-version-10045-02-23.mp3',
    'https://cdn.uppbeat.io/audio-files/4c2acfacd00e6047810cd3a48697d3a3/060a92e1216eed438f5460bacf0ce846/501d17f3aab5d1f6f67d3a405833d823/STREAMING-stellar-escape-prigida-main-version-25318-03-02.mp3',
    'https://cdn.uppbeat.io/audio-output/531/3057/main-version/streaming-previews/STREAMING-eyes-wide-open-matrika-main-version-02-25-11468.mp3',
    'https://cdn.uppbeat.io/audio-files/976c5cd0422903916639fdd87df459b7/9c4def493d026dfbcf556043c0f4dce4/240fb67fed344f1251fa45a1a585a290/STREAMING-innovation-hey-pluto-main-version-2517-02-13.mp3',
    'https://cdn.uppbeat.io/audio-output/303/2072/main-version/streaming-previews/STREAMING-fresh-air-mountaineer-main-version-02-52-7640.mp3',
    'https://cdn.uppbeat.io/audio-files/32ed1ea8a647cae58ad0a4b0b67bcef9/34d538f84e1ff07955cd7577e2cda6f2/4e593df093c30d56cad331954a597057/STREAMING-stardust-danijel-zambo-main-version-1372-03-13.mp3',
    'https://cdn.uppbeat.io/audio-files/ca51760c641519bcff2c32cdf8e83fff/3900208d9f7d807c9ca241fc9e47615f/83a1343e5b8e80fab1e119b15772ee1c/STREAMING-blue-sea-swoop-main-version-18177-01-14.mp3',
    'https://cdn.uppbeat.io/audio-output/543/3260/main-version/streaming-previews/STREAMING-modify-swoop-main-version-01-28-12367.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/aaae629b65d8fae44c43a163a21de2e7/5d785d246db818cc74d9d7f911ec5db6/STREAMING-space-journey-hartzmann-main-version-15284-03-33.mp3',
    'https://cdn.uppbeat.io/audio-files/90460af8401a0c906aa65f33459c4428/9f7a7fe8ac445681414f57e010cb377c/4dfcbf898dcff24c73eb83abe9405c39/STREAMING-chasing-freedom-vens-adams-main-version-5006-01-56.mp3',
    'https://cdn.uppbeat.io/audio-output/172/2361/main-version/streaming-previews/STREAMING-dreamline-abbynoise-main-version-02-19-8683.mp3',
    'https://cdn.uppbeat.io/audio-output/336/2668/main-version/streaming-previews/STREAMING-with-the-winds-volo-main-version-05-15-10020.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/d547165c2d1dd8d1d9768ddf28a5dacb/e78138cf5f3fb849af7361967b4912f5/STREAMING-clear-sky-hartzmann-main-version-5299-02-20.mp3',
    'https://cdn.uppbeat.io/audio-files/93e462f9425d0f25e9d339d3caab680a/560ac63a9ec50fcf93f4f3074477002e/fc377480afe502ef5845bb81456f8225/STREAMING-clarity-zoo-main-version-3620-03-15.mp3',
    'https://cdn.uppbeat.io/audio-files/3e736df8037fc2ea4d137bf5e8b6287c/23644f1869c4dad44b4d9386c09ccd5f/7ba2ede95fd10e7ced902c7f38267ed0/STREAMING-flowing-stream-yeti-music-main-version-21536-00-31.mp3',
    'https://cdn.uppbeat.io/audio-files/578df957bfa8068a40f9957bab448d08/82e9f61e8757df45b8aa40bbc283d394/79ad23565478d815e6baab756f962f44/STREAMING-change-way-hartzmann-main-version-17889-04-55.mp3'
];

const calmSources = [
    'https://cdn.uppbeat.io/audio-files/5dfbc12f82c94629f611d67857f9856a/0eb19a6fb3d21c02fe9c4022bd1bf2fd/8c4b5ebe8e3874f85ebf11df961fd360/STREAMING-rule-of-life-brock-hewitt-stories-in-sound-main-version-29683-03-53.mp3',
    'https://cdn.uppbeat.io/audio-output/5/265/main-version/streaming-previews/STREAMING-lost-in-thoughts-ak-main-version-02-10-1310.mp3',
    'https://cdn.uppbeat.io/audio-files/6dc9bc42bb6db2adb9da948c6d4cc319/e7bca11a65c2367d0a351bac0cc26659/0311341eb714bd57a5cd71f376f13776/STREAMING-blue-waters-yasumu-main-version-22452-02-24.mp3',
    'https://cdn.uppbeat.io/audio-output/5/275/main-version/streaming-previews/STREAMING-hypotheticals-ak-main-version-02-01-1320.mp3',
    'https://cdn.uppbeat.io/audio-files/5dfbc12f82c94629f611d67857f9856a/1e617c65e4d66a58198e32a811a44b59/fb1619078e042f5413fbcd3613a6b3fc/STREAMING-ages-ago-brock-hewitt-stories-in-sound-main-version-16212-04-06.mp3',
    'https://cdn.uppbeat.io/audio-files/15a30d6e9cb41e3406ef9a71bcd32532/5eb8c0b11620b2b58580adc5fa7ccbc1/71e19ee166c4ab841d562ccb09a6fda7/STREAMING-shine-revo-main-version-17686-02-54.mp3',
    'https://cdn.uppbeat.io/audio-output/82/1387/main-version/streaming-previews/STREAMING-hometown-northwestern-main-version-02-42-4402.mp3',
    'https://cdn.uppbeat.io/audio-output/304/1222/main-version/streaming-previews/STREAMING-serenity-ilya-kuznetsov-main-version-03-38-3939.mp3',
    'https://cdn.uppbeat.io/audio-files/6fe37c64db62e03d698e462645fa35a7/5686c5d9e29a0283b29d9be3c30ceee6/3308900c9fb1baa575a2e86f46079e71/STREAMING-sweetness-of-the-moment-pecan-pie-main-version-18665-02-24.mp3',
    'https://cdn.uppbeat.io/audio-files/6acf0e1e998166efd11dea1a992a0780/bf7f5058732d57fb99e543dc1499052a/9c5e95c2b8c7912cd8a635e9860c376e/STREAMING-dreamland-jonny-easton-main-version-17345-30-17.mp3',
    'https://cdn.uppbeat.io/audio-files/dea4043ccc3a0740a011ed2d8284ee82/856215c64d701632f473f66ac48fdb4f/d441b1d31f5030f5f38d84aa116a0493/STREAMING-gentle-awareness-oliver-massa-main-version-32790-06-24.mp3',
    'https://cdn.uppbeat.io/audio-output/393/3514/main-version/streaming-previews/STREAMING-soothing-dream-revo-main-version-01-18-13143.mp3',
    'https://cdn.uppbeat.io/audio-files/7ca00d8b9e9088256e127670a0c823d2/2a6b5d07ae3880fe79f9ef52e948b518/542ac3e3b37676a87a2c1ba4971ef91e/STREAMING-reverie-studiokolomna-main-version-28865-01-59.mp3',
    'https://cdn.uppbeat.io/audio-output/159/2848/main-version/streaming-previews/STREAMING-calm-zimpzon-main-version-07-55-10844.mp3',
    'https://cdn.uppbeat.io/audio-files/f1b6cf9749ee3ff1565e8e6c8e2f483d/08f20734e983aa059f475b13bc39d137/b28d8e45963537b9fa86a25a1f858320/STREAMING-closing-a-chapter-poetri-main-version-25596-02-37.mp3',
    'https://cdn.uppbeat.io/audio-files/1d539a11278b5abd885fd21387716480/d2bdfb9c2ee90c994807d42756ea9e4d/97bbb361a871912fb5db2b0a6d84e509/STREAMING-gently-does-it-justin-lee-main-version-16508-02-09.mp3',
    'https://cdn.uppbeat.io/audio-output/124/820/main-version/streaming-previews/STREAMING-peaceful-morning-yeti-music-main-version-00-35-3025.mp3',
    'https://cdn.uppbeat.io/audio-output/5/271/main-version/streaming-previews/STREAMING-sky-high-ak-main-version-03-30-1316.mp3',
    'https://cdn.uppbeat.io/audio-files/1681cd49bc5562538e7d2edc7340ad00/95168f9bfa9fd9bbfdd8fe96b06cb9ec/b61db2521e75b13d39d10fde5b9e9735/STREAMING-bliss-david-bullard-main-version-23806-03-02.mp3',
    'https://cdn.uppbeat.io/audio-files/34c10e66287f2d6310a13c341ed6f152/50068231c0def4ef16e42a43577835fc/e9a09b8387903ea85368f2e4eee5718a/STREAMING-fireflies-ambient-boy-main-version-13500-09-58.mp3'
];

let audioSources = defaultSources;

const completeSoundFx = 'https://cdn.uppbeat.io/audio-files/d927511931994ce45cf5b95b34e23536/b8acdddc6e37f6b47b0057dbaf3b53af/9c3ce15f497635d0c185b92d34ce902c/STREAMING-level-complete-winner-piano-om-fx-1-00-06.mp3';

const sunSoundFx = 'https://cdn.uppbeat.io/audio-files/44fbdf1792559839ac2aaf16cfa6b689/0b1eaccdf444f42aae30a96da4e5250c/7526d6c2f348547b4dbb742a0f1fc776/STREAMING-cuckoo-raven-bird-call-ambience-ivo-vicic-1-01-41.mp3';
const rainSoundFx = 'https://cdn.uppbeat.io/audio-files/8f7bad86600558899edb9677072692ee/c5a6544ca4d77d8cda881bae989f35de/c9b7d8fbdcf58a6e5a9bb4ee160b9cbb/STREAMING-rain-outside-window-betacut-medium-1-01-00.mp3';
const thunderSoundFx = 'https://cdn.pixabay.com/audio/2024/02/19/audio_8d25df9ef0.mp3';

const typingSoundFx = 'https://cdn.pixabay.com/audio/2022/02/07/audio_ddfb1f8f33.mp3';
const cafeSoundFx = 'https://cdn.pixabay.com/audio/2022/03/09/audio_f8356168cb.mp3';

// Reminder and Popup Functions
function showReminder() {
    document.querySelector('#reminderPopup').style.display = 'block';
    window.audioPlayer.pause();
    resetTimer();
    toggleTheme();
    // Play completion sound effect once
    const completionSound = new Audio(completeSoundFx);
    completionSound.play().then(() => {
        completionSound.remove(); // Remove the audio element after playing
    }).catch(error => {
        console.error('Error playing completion sound:', error);
    });
    // Disable interaction with other elements
    document.body.style.pointerEvents = 'none';
    document.querySelector('#reminderPopup').style.pointerEvents = 'auto';

    // Add event listener to re-enable interactions when popup is closed
    document.querySelector('#reminderPopup').querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            document.body.style.pointerEvents = 'auto';
            document.querySelector('#reminderPopup').style.display = 'none';
        }, { once: true });
    });
}

// Accomplishment Functions
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function loadAccomplishments() {
    fetch('/accomplishments', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        data.forEach(item => {
            accomp.push({ text: item.text, time: item.time });
        })
        updateAccomplishmentsList();
    })
    .catch((error) => console.error('Error loading JSON file', error));
}
function closeReminderPopup() {
    document.querySelector('#reminderPopup').style.display = 'none';
    document.body.style.pointerEvents = 'auto';
}

function submitAccomplishment() {
    const input = document.querySelector('#accomplishmentInput');
    const accomplishment = input.value.trim();

    if (accomplishment) {
        const timestamp = new Date().toLocaleString();

        // First, let's create the data to be sent
        const newAccomplishment = {
            text: accomplishment,
            time: timestamp
        };
        
        // server side POST method
        fetch('/save-accomplishment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newAccomplishment),
        })
        .then(response => {
            console.log({response});
            response.json();
            accomp.push(newAccomplishment);
            updateAccomplishmentsList();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
        input.value = '';
    }

    document.querySelector('#reminderPopup').style.display = 'none';
    resetTimer();
    toggleTheme();
}

function updateAccomplishmentsList() {
    const list = document.querySelector('#accomplishmentsList');
    list.innerHTML = '';
    accomp.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.time}</span>: ${item.text}`;
        
        const deleteButton = document.createElement('button');
        deleteButton.id = 'accompDelete';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteAccomplishment(index);
        
        li.appendChild(deleteButton);
        list.appendChild(li);
    });
}

function deleteAccomplishment(index) {
    const accomplishment = accomp[index];
    if (confirm(`Are you sure you want to delete this accomplishment?\n\n'${accomplishment.text}'`)) {
        fetch('/delete-accomplishment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index: index }),
        })
        .then(response => response.json())
        .then(() => {
            accomp.splice(index, 1);
            updateAccomplishmentsList();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

function clearAccomplishments() {
    if (confirm('Are you sure you want to clear all accomplishments? This action cannot be undone.')) {
        accomp = [];
        updateAccomplishmentsList();
        fetch('/clear-accomplishments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log({response});
            response.json();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

function exportAccomplishments() {
    const jsonData = JSON.stringify(accomp, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    var tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
    var dateTime = (new Date(Date.now() - tzoffset)).toISOString();
    a.download = `accomplishments-${dateTime}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// Timer Functions
function updateTimer() {
    if (!isPaused) {
        timerSeconds--;
        if (timerSeconds <= 0) {
            showReminder();
            return;
        }

        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('#timer').textContent = timeString;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 1500; // Reset to 1 hour
    document.querySelector('#timer').textContent = '00:25:00';
    document.querySelector('#custom-hours').value = 0;
    document.querySelector('#custom-minutes').value = 25;
    document.querySelector('#custom-seconds').value = 0;

    isPaused = true;
    window.audioPlayer.pause();
    document.querySelector('#pauseResume').textContent = 'Play';
    document.querySelector('#playPauseIcon').className = 'fa fa-play';
    timerInterval = setInterval(updateTimer, 1000);
    // document.body.classList.toggle('dark-theme');
}

function customizeTimer() {
    const hours = parseInt(document.querySelector('#custom-hours').value) || 0;
    const minutes = parseInt(document.querySelector('#custom-minutes').value) || 0;
    const seconds = parseInt(document.querySelector('#custom-seconds').value) || 0;

    if (hours >= 0 && minutes >= 0 && seconds >= 0) {
        timerSeconds = hours * 3600 + minutes * 60 + seconds;
        if (timerSeconds > 0) {
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            
            document.querySelector('#pauseResume').textContent = 'Play';
            document.querySelector('#playPauseIcon').className = 'fas fa-play';
            document.querySelector('#timer').textContent = `${formatTime(hours,minutes,seconds)}`;
        } else {
            alert('Please enter a valid time greater than 0 seconds.');
        }
    } else {
        alert('Please enter valid positive numbers for hours, minutes, and seconds.');
    }
}

function formatTime(hours, minutes, seconds) {
    return [hours, minutes, seconds]
        .map(v => v < 10 ? '0' + v : v)
        .join(':');
}

function pauseResumeTimer() {
    isPaused = !isPaused;
    document.querySelector('#pauseResume').textContent = isPaused ? 'Play' : 'Pause';
    if (isPaused && window.audioPlayer) {
        window.audioPlayer.pause();
        document.querySelector('#playPauseIcon').className = 'fas fa-play'
    } else if (!isPaused && window.audioPlayer) {
        window.audioPlayer.play().catch(error => {
            console.error('Error resuming audio:', error);
        }).then(() => document.querySelector('#playPauseIcon').className = 'fas fa-pause');
    }
}

// Audio Functions
function playRandomAudio() {
    // const randomSource = audioSources[Math.floor(Math.random() * audioSources.length)];
    const randomSource = audioSources[Math.floor(Math.random() * new Date().getTime() % audioSources.length)];

    window.audioPlayer = new Audio(randomSource);
    window.audioPlayer.addEventListener('error', function(e) {
        console.log(`Error loading audio ${randomSource}, play the next audio file`);
        nextTrack();
        window.audioPlayer.play().catch(error => {
            console.error('Error playing the next audio:', error);
        });
    });
    window.audioPlayer.addEventListener('ended', function() {
        nextTrack();
        window.audioPlayer.play().catch(error => {
            console.error('Error playing the next audio:', error);
        });
    });
    window.audioPlayer.loop = isLoop;
    window.audioPlayer.volume = 0.8; // 80% volume
}

function previousTrack() {
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex - 1 + audioSources.length) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.querySelector('#playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
        })
        .catch(error => {
            console.error('Error playing previous track:', error);
        });
    }
}

function nextTrack() {
    if (window.audioPlayer) {
        const currentIndex = audioSources.indexOf(window.audioPlayer.src);
        const newIndex = (currentIndex + 1) % audioSources.length;
        window.audioPlayer.src = audioSources[newIndex];
        window.audioPlayer.play()
        .then(()=> {
            document.querySelector('#playPauseIcon').className = 'fas fa-pause';
            isPaused = false;
        })
        .catch(error => {
            console.error('Error playing next track:', error);
        });
    }
}

function changeAudioSource() {
    const selectedSource = document.querySelector('#audioSourceDropdown').value;
    const vinylLabel = document.querySelector('#vinyl-label-text');
    console.info(`Setting audio source to ${selectedSource}`);

    switch(selectedSource) {
        case 'ghibliInspired':
            audioSources = ghibliInspiredSources;
            vinylLabel.textContent = 'Ghibli';
            break;
        case 'lazyLofi':
            audioSources = lazyLofiSources;
            vinylLabel.textContent = 'Lazy';
            break;
        case 'lofiChill':
            audioSources = lofiChillSources;
            vinylLabel.textContent = 'Lo-Fi';
            break;
        case 'jazzBeats':
            audioSources = jazzBeatsSources;
            vinylLabel.textContent = 'Jazz';
            break;
        case 'sad':
            audioSources = sadSources;
            vinylLabel.textContent = 'Sad';
            break;
        case 'goodVibe':
            audioSources = goodVibeSources;
            vinylLabel.textContent = 'Good Vibe';
            break;
        case 'timelapse':
            audioSources = timelapseSources;
            vinylLabel.textContent = 'Timelapse';
            break;
        case 'calm':
            audioSources = calmSources;
            vinylLabel.textContent = 'Calm';
            break;
        default:
            audioSources = defaultSources;
            vinylLabel.textContent = 'Lo-Fi';
            break;
    }
    
    // If audio is currently playing, switch to a randome track of the new source
    if (window.audioPlayer && !window.audioPlayer.paused) {
        const randomSource = audioSources[Math.floor(Math.random() * new Date().getTime() % audioSources.length)];
        window.audioPlayer.src = randomSource;
        window.audioPlayer.play().catch(error => {
            console.error('Error playing new audio source:', error);
        });
    }
}


function toggleLoop() {    
    console.log(`Toggling loop to ${!isLoop}`);
    if (window.audioPlayer) {
        isLoop = !isLoop;
        window.audioPlayer.loop = isLoop; 
        const loopToggleButton = document.querySelector('#loopToggle');
        if (isLoop) {
            loopToggleButton.classList.add('dark-theme');
        } else {
            loopToggleButton.classList.remove('dark-theme');
        }
    }
}

function toggleSun() {
    const sunGlare = document.querySelector('.sun-glare');
    const skyBackground = document.querySelector('.sky-background');
    
    const sunToggle = document.querySelector('#sunToggle');    
    const rainToggle = document.querySelector('#rainToggle');
    const thunderToggle = document.querySelector('#thunderToggle');

    if (!window.sunAudio) {
        window.sunAudio = new Audio(sunSoundFx);
        window.sunAudio.volume = 0.5;
        window.sunAudio.loop = true;
    }
    
    if (sunToggle.classList.contains('dark-theme')) {
        console.info('❌☀️');
        sunGlare.style.display = 'none';
        skyBackground.style.display = 'none';
        sunToggle.classList.remove('dark-theme');
        window.sunAudio?.pause();
        
        // Remove existing glare
        sunGlare.innerHTML = '';
        skyBackground.innerHTML = '';
    } else {
        console.info('☀️☀️');
        
        // Remove Rain/Thunder if toggled on
        rainToggle.classList.contains('dark-theme') ? toggleRain() : console.log("Not rainy 😊");
        thunderToggle.classList.contains('dark-theme') ? toggleThunder() : console.log("Not thundering 😊");

        sunGlare.style.display = 'block';
        skyBackground.style.display = 'block';
        sunToggle.classList.add('dark-theme');
        window.sunAudio.play();
    }
}

function createRain() {
    const rainContainer = document.querySelector('.rain');
    const drop = document.createElement('div');
    drop.classList.add('raindrop');

    const size = Math.random() * 2 + 1;
    const posX = Math.floor(Math.random() * window.innerWidth);
    const delay = Math.random() * -20;
    const duration = Math.random() * 1 + 0.5;

    drop.style.left = posX + 'px';
    drop.style.width = size + 'px';
    drop.style.animationDelay = delay + 's';
    drop.style.animationDuration = duration + 's';

    rainContainer.appendChild(drop);

    setTimeout(() => {
      drop.remove();
    }, duration * 1000);
}
  
function toggleRain() {
    const rainContainer = document.querySelector('.rain');
    const rainToggle = document.querySelector('#rainToggle');
    if (!window.rainAudio) {
        window.rainAudio = new Audio(rainSoundFx);
        window.rainAudio.volume = 0.5;
        window.rainAudio.loop = true;
    }

    if (rainToggle.classList.contains('dark-theme')) {
        console.info('❌🌧️');
        rainContainer.style.display = 'none';
        rainToggle.classList.remove('dark-theme');
        window.rainAudio?.pause();
        // Stop rain animation
        clearInterval(window.rainInterval);
        // Remove existing raindrops
        rainContainer.innerHTML = '';
    } else {
        console.info('🌧️🌧️');
        rainContainer.style.display = 'block';
        rainToggle.classList.add('dark-theme');
        window.rainAudio.play();

        // Start rain animation
        window.rainInterval = setInterval(createRain, 20);
    }
  }

function toggleThunder() {
    const thunderToggle = document.querySelector('#thunderToggle');

    if (!window.thunderAudio) {
        window.thunderAudio = new Audio(thunderSoundFx);
        window.thunderAudio.volume = 0.6;
        window.rainAudio.loop = true;
    }

    if (thunderToggle.classList.contains('dark-theme')) {
        console.info('❌⚡');
        thunderToggle.classList.remove('dark-theme');
        window.thunderAudio.pause();
    } else {
        console.info('⚡⚡');
        thunderToggle.classList.add('dark-theme');
        window.thunderAudio.play();
    }
}

function toggleTyping() {
    const typingToggle = document.querySelector('#typingToggle');

    if (!window.typingAudio) {
        window.typingAudio = new Audio(typingSoundFx);
        window.typingAudio.volume = 0.6;
        window.rainAudio.loop = true;
    }

    if (typingToggle.classList.contains('dark-theme')) {
        console.info('❌⌨️');
        typingToggle.classList.remove('dark-theme');
        window.typingAudio.pause();
    } else {
        console.info('⌨️⌨️');
        typingToggle.classList.add('dark-theme');
        window.typingAudio.play();
    }
}

function toggleCafe() {
    const cafeToggle = document.querySelector('#cafeToggle');

    if (!window.cafeAudio) {
        window.cafeAudio = new Audio(cafeSoundFx);
        window.cafeAudio.volume = 0.7;
        window.rainAudio.loop = true;
    }

    if (cafeToggle.classList.contains('dark-theme')) {
        console.info('❌☕');
        cafeToggle.classList.remove('dark-theme');
        window.cafeAudio.pause();
    } else {
        console.info('☕☕');
        cafeToggle.classList.add('dark-theme');
        window.cafeAudio.play();
    }
}


// Start the timer immediately
window.onload = async function() {
    loadAccomplishments();
    playRandomAudio();
    resetTimer();
};
