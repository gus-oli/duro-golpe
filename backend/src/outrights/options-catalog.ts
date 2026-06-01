import { OUTRIGHT_MARKET_CODES, type OutrightMarketCode } from './catalog.js'
import type { OutrightPlayerSourceTier } from './player-option-types.js'

export interface PlayerMarketOption {
  label: string
  teamLabel: string
  sourceTier: OutrightPlayerSourceTier
  isFeatured: boolean
}

interface OfficialSquad {
  teamLabel: string
  goalkeepers: readonly string[]
  outfield: readonly string[]
}

function player(
  name: string,
  teamLabel: string,
  sourceTier: OutrightPlayerSourceTier,
  isFeatured = false,
): PlayerMarketOption {
  return {
    label: `${name} - ${teamLabel}`,
    teamLabel,
    sourceTier,
    isFeatured,
  }
}

function createOfficialSquadOptions(
  squads: readonly OfficialSquad[],
  include: 'all' | 'goalkeepers',
): PlayerMarketOption[] {
  return squads.flatMap((squad) => {
    const names = include === 'goalkeepers'
      ? squad.goalkeepers
      : [...squad.goalkeepers, ...squad.outfield]

    return names.map((name) => player(name, squad.teamLabel, 'OFFICIAL'))
  })
}

function mergePlayerMarketOptions(
  curated: readonly PlayerMarketOption[],
  officialCatalog: readonly PlayerMarketOption[],
): PlayerMarketOption[] {
  const options = [...curated]
  const seenLabels = new Set(curated.map((option) => option.label))

  for (const option of officialCatalog) {
    if (seenLabels.has(option.label)) {
      continue
    }

    seenLabels.add(option.label)
    options.push(option)
  }

  return options
}

const OFFICIAL_SQUADS: readonly OfficialSquad[] = [
  {
    teamLabel: 'Africa do Sul',
    goalkeepers: ['Ronwen Williams', 'Ricardo Goss', 'Sipho Chaine'],
    outfield: ['Khuliso Mudau', 'Nkosinathi Sibisi', 'Ime Okon', 'Khulumani Ndamane', 'Aubrey Modiba', 'Samukelo Kabini', 'Thabang Matuludi', 'Olwethu Makhanya', 'Kamogelo Sebelebele', 'Bradley Cross', 'Mbekezeli Mbokazi', 'Teboho Mokoena', 'Thalente Mbatha', 'Sphephelo Sithole', 'Jayden Adams', 'Oswin Appollis', 'Iqraam Rayners', 'Tshepang Moremi', 'Relebohile Mofokeng', 'Evidence Makgopa', 'Themba Zwane', 'Lyle Foster', 'Thapelo Maseko'],
  },
  {
    teamLabel: 'Alemanha',
    goalkeepers: ['Oliver Baumann', 'Manuel Neuer', 'Alexander Nubel'],
    outfield: ['Waldemar Anton', 'Nathaniel Brown', 'Pascal Gross', 'Joshua Kimmich', 'Felix Nmecha', 'Aleksandar Pavlovic', 'David Raum', 'Antonio Rudiger', 'Nico Schlotterbeck', 'Angelo Stiller', 'Jonathan Tah', 'Malick Thiaw', 'Nadiem Amiri', 'Maximilian Beier', 'Leon Goretzka', 'Kai Havertz', 'Lennart Karl', 'Jamie Leweling', 'Jamal Musiala', 'Leroy Sane', 'Deniz Undav', 'Florian Wirtz', 'Nick Woltemade'],
  },
  {
    teamLabel: 'Arabia Saudita',
    goalkeepers: ['Ahmed Al Kassar', 'Mohammed Al Owais', 'Nawaf Al Aqidi'],
    outfield: ['Saud Abdulhamid', 'Mohammed Abu Al Shamat', 'Khalid Al Ghannam', 'Moteb Al Harbi', 'Abdulelah Al Amri', 'Nawaf Boushal', 'Hassan Kadesh', 'Ali Lajami', 'Ali Majrashi', 'Hassan Tambakti', 'Jehad Thikri', 'Nasser Al Dawsari', 'Alaa Al Hajji', 'Ziyad Al Johani', 'Musab Al Juwayr', 'Abdullah Al Khaibari', 'Mohammed Kanno', 'Sultan Mandash', 'Ayman Yahya', 'Feras Al Brikan', 'Salem Al Dawsari', 'Abdullah Al Hamdan', 'Saleh Al Shehri'],
  },
  {
    teamLabel: 'Argelia',
    goalkeepers: ['Luca Zidane', 'Oussama Benbot', 'Melvin Mastil', 'Abdelatif Ramdane'],
    outfield: ['Rafik Belghali', 'Samir Chergui', 'Rayan Ait-Nouri', 'Jaouen Hadjam', 'Aissa Mandi', 'Ramy Bensebaini', 'Zineddine Belaid', 'Achref Abada', 'Mohamed Amine Tougai', 'Nabil Bentaleb', 'Hicham Boudaqui', 'Houssem Aouar', 'Fares Chaibi', 'Ibrahim Maza', 'Yacine Titraoui', 'Ramiz Zerrouki', 'Mohamed Amine Amoura', 'Nadhir Benbouali', 'Adil Boulbina', 'Fares Ghedjemis', 'Amine Gouri', 'Anis Hadj Moussa', 'Riyad Mahrez'],
  },
  {
    teamLabel: 'Argentina',
    goalkeepers: ['Emiliano Martinez', 'Geronimo Rulli', 'Juan Musso'],
    outfield: ['Nahuel Molina', 'Gonzalo Montiel', 'Cuti Romero', 'Otamendi', 'Lisandro Martinez', 'Leonardo Balerdi', 'Nicolas Tagliafico', 'Facundo Medina', 'De Paul', 'Enzo Fernandez', 'Paredes', 'Mac Allister', 'Valentin Barco', 'Lo Celso', 'Exequiel Palacios', 'Thiago Almada', 'Nico Paz', 'Lionel Messi', 'Nico Gonzalez', 'Giuliano Simeone', 'Flaco Lopez', 'Julian Alvarez', 'Lautaro Martinez'],
  },
  {
    teamLabel: 'Australia',
    goalkeepers: ['Patrick Beach', 'Paul Izzo', 'Maty Ryan'],
    outfield: ['Aziz Behich', 'Jordan Bos', 'Cameron Burgess', 'Alessandro Circati', 'Milos Degenek', 'Jason Geria', 'Lucas Herrington', 'Jacob Italiano', 'Harry Souttar', 'Kai Trewin', 'Cameron Devlin', 'Ajdin Hrustic', 'Jackson Irvine', 'Connor Metcalfe', "Paul Okon-Engstler", 'Nestory Irankunda', 'Mathew Leckie', 'Awer Mabil', 'Mohamed Toure', 'Nishan Velupillay', 'Cristian Volpato', 'Tete Yengi'],
  },
  {
    teamLabel: 'Austria',
    goalkeepers: ['Alexander Schlager', 'Florian Wiegele', 'Patrick Pentz'],
    outfield: ['David Affengruber', 'Kevin Danso', 'Stefan Posch', 'David Alaba', 'Philipp Lienhart', 'Phillipp Mwene', 'Alexander Prass', 'Marco Friedl', 'Michael Svoboda', 'Xaver Schlager', 'Nicolas Seiwald', 'Marcel Sabitzer', 'Florian Grillitsch', 'Carney Chukwuemeka', 'Romano Schmid', 'Christoph Baumgartner', 'Konrad Laimer', 'Patrick Wimmer', 'Paul Wanner', 'Alessandro Schopf', 'Marko Arnautovic', 'Michael Gregoritsch', 'Sasa Kalajdzic'],
  },
  {
    teamLabel: 'Belgica',
    goalkeepers: ['Courtois', 'Lammens', 'Mike Penders'],
    outfield: ['Timothy Castagne', 'Zeno Debast', 'Koni De Winter', 'Brandon Mechele', 'Arthur Theate', 'Maxim De Cuyper', 'Thomas Meunier', 'Nathan Ngoy', 'Joaquin Seys', 'Kevin De Bruyne', 'Amadou Onana', 'Nicolas Raskin', 'Youri Tielemans', 'Hans Vanaken', 'Axel Witsel', 'Charles De Ketelaere', 'Mathias Fernandez-Pardo', 'Jeremy Doku', 'Romelu Lukaku', 'Alexis Saelemaekers', 'Leandro Trossard', 'Dodi Lukebakio', 'Diego Moreira'],
  },
  {
    teamLabel: 'Bosnia',
    goalkeepers: ['Nikola Vasilj', 'Martin Zlomislic', 'Osman Hadzikic'],
    outfield: ['Sead Kolasinac', 'Amar Dedic', 'Nihad Mujakic', 'Nikola Katic', 'Tarik Muharemovic', 'Stjepan Radeljic', 'Dennis Hadzikadunic', 'Nidal Celik', 'Amir Hadziahmetovic', 'Ivan Sunjic', 'Ivan Basic', 'Dzenis Burnic', 'Benjamin Tahirovic', 'Amar Memic', 'Armin Gigovic', 'Kerim Alajbegovic', 'Esmir Bajraktarevic', 'Ermin Mahmic', 'Ermedin Demirovic', 'Jovo Lukic', 'Samed Bazdar', 'Haris Tabakovic', 'Edin Dzeko'],
  },
  {
    teamLabel: 'Brasil',
    goalkeepers: ['Alisson', 'Ederson', 'Weverton'],
    outfield: ['Alex Sandro', 'Bremer', 'Danilo', 'Douglas Santos', 'Gabriel Magalhaes', 'Ibanez', 'Leo Pereira', 'Marquinhos', 'Wesley', 'Bruno Guimaraes', 'Casemiro', 'Danilo Santos', 'Fabinho', 'Lucas Paqueta', 'Endrick', 'Gabriel Martinelli', 'Igor Thiago', 'Luiz Henrique', 'Matheus Cunha', 'Neymar', 'Raphinha', 'Rayan', 'Vini Jr.'],
  },
  {
    teamLabel: 'Cabo Verde',
    goalkeepers: ['Josimar Dias', 'Marcio da Rosa', 'Carlos Santos'],
    outfield: ['Steven Moreira', 'Wagner Pina', 'Sidny Cabral', 'Logan Costa', 'Roberto Lopes', 'Kelvin Pires', 'Ianique Tavares', 'Edilson Borges', 'Jamiro Monteiro', 'Deroy Duarte', 'Kevin Pina', 'Laros Duarte', 'Telmo Arcanjo', 'Yannick Semedo', 'Joao Paulo Fernandes', 'Garry Rodrigues', 'Jovane Cabral', 'Ryan Mendes', 'Nuno da Costa', 'Dailon Livramento', 'Gilson Benchimol', 'Willy Semedo', 'Helio Varela'],
  },
  {
    teamLabel: 'Canada',
    goalkeepers: ['Dayne St. Clair', 'Maxim Crepeau', 'Owen Goodman'],
    outfield: ['Alistair Johnston', 'Derek Cornelius', 'Richie Laryea', 'Kiko Sigur', 'Joel Waterman', 'Luc de Fougerolles', 'Moise Bombito', 'Alfie Jones', 'Alphonso Davies', 'Stephen Eustaquio', 'Ismael Kone', 'Tajon Buchanan', 'Mathieu Choiniere', 'Ali Ahmed', 'Nathan Saliba', 'Liam Millar', 'Marcelo Flores', 'Jacob Shaffelburg', 'Jonathan Osorio', 'Jonathan David', 'Cyle Larin', 'Tani Oluwaseyi', 'Promise David'],
  },
  {
    teamLabel: 'Colombia',
    goalkeepers: ['Camilo Vargas', 'Alvaro Montero', 'David Ospina'],
    outfield: ['Davinson Sanchez', 'Jhon Lucumi', 'Yerry Mina', 'Daniel Munoz', 'Willer Ditta', 'Santiago Arias', 'Johan Mojica', 'Deiver Machado', 'Richard Rios', 'Jefferson Lerma', 'Kevin Castano', 'Gustavo Puerta', 'Jhon Arias', 'Jorge Carrascal', 'Juan Portilla', 'Juan Quintero', 'James Rodriguez', 'Jaminton Campaz', 'Cucho Hernandez', 'Luis Diaz', 'Luis Suarez', 'Andres Gomez', 'Jhon Cordoba'],
  },
  {
    teamLabel: 'Coreia do Sul',
    goalkeepers: ['Kim Seunggyu', 'Song Bumkeun', 'Jo Hyeonwoo'],
    outfield: ['Kim Moonhwan', 'Kim Min-jae', 'Kim Taehyeon', 'Park Jinseob', 'Seol Youngwoo', 'Jens Castrop', 'Lee Kihyuk', 'Lee Taeseok', 'Lee Hanbeom', 'Cho Yumin', 'Kim Jingyu', 'Bae Junho', 'Paik Seungho', 'Yang Hyunjun', 'Eom Jisung', 'Lee Kang-in', 'Lee Donggyeong', 'Lee Jaesung', 'Hwang Inbeom', 'Hwang Heechan', 'Son Heung-min', 'Oh Hyeongyu', 'Cho Gue-sung'],
  },
  {
    teamLabel: 'Costa do Marfim',
    goalkeepers: ['Yahia Fofana', 'Mohamed Kone', 'Alban Lafont'],
    outfield: ['Emmanuel Agbadou', 'Clement Akpa', 'Ousmane Diomande', 'Guela Doue', 'Ghislan Konan', 'Odilon Kossounou', 'Evan Ndicka', 'Wilfried Singo', 'Seko Fofana', 'Parfait Guiagon', 'Christ Inao Oulai', 'Franck Kessie', 'Ibrahim Sangare', 'Jean-Mickael Seri', 'Simon Adingra', 'Ange-Yoan Bonny', 'Amad Diallo', 'Oumar Diakite', 'Yan Diomande', 'Evann Guessand', 'Nicolas Pepe', 'Bazoumana Toure', 'Elye Wahi'],
  },
  {
    teamLabel: 'Croacia',
    goalkeepers: ['Dominik Livakovic', 'Dominik Kotarski', 'Ivor Pandur'],
    outfield: ['Josko Gvardiol', 'Duje Caleta-Car', 'Josip Sutalo', 'Josip Stanisic', 'Marin Pongracic', 'Martin Erlic', 'Luka Vuskovic', 'Luka Modric', 'Mateo Kovacic', 'Mario Pasalic', 'Nikola Vlasic', 'Luka Sucic', 'Martin Baturina', 'Kristijan Jakic', 'Petar Sucic', 'Nikola Moro', 'Toni Fruk', 'Ivan Perisic', 'Andrej Kramaric', 'Ante Budimir', 'Marco Pasalic', 'Petar Musa', 'Igor Matanovic'],
  },
  {
    teamLabel: 'Curacao',
    goalkeepers: ['Tyrick Bodak', 'Trevor Doornbusch', 'Eloy Room'],
    outfield: ['Riechedly Bazoer', 'Joshua Brenet', 'Roshon Van Eijma', 'Sherel Floranus', 'Deveron Fonville', 'Jurien Gaari', 'Armando Obispo', 'Shurandy Sambo', 'Juninho Bacuna', 'Leandro Bacuna', 'Livano Comenencia', 'Kevin Felida', "AR'Jany Martha", 'Tyrese Noslin', 'Godfried Roemeratoe', 'Jeremy Antonisse', 'Tahith Chong', 'Kenji Gorre', 'Sontje Hansen', 'Gervane Kastaneer', 'Brandley Kuwas', 'Jurgen Locadia', 'Jearl Margaritha'],
  },
  {
    teamLabel: 'Egito',
    goalkeepers: ['Mohamed El Shenawy', 'Mostafa Shobeir', 'El Mahdy Soliman', 'Mohamed Alaa'],
    outfield: ['Mohamed Hany', 'Tarek Alaa', 'Hamdi Fathi', 'Ramy Rabia', 'Yasser Ibrahim', 'Hossam Abdelmaguid', 'Mohamed Abdelmonem', 'Ahmed Fatouh', 'Karim Hafez', 'Marwan Attia', 'Mohannad Lasheen', 'Nabil Emad Dunga', 'Mahmoud Saber', 'Ahmed Sayed Zizo', 'Mahmoud Trezeguet', 'Emam Ashour', 'Mostafa Ziko', 'Ibrahim Adel', 'Haitham Hassan', 'Mohamed Salah', 'Omar Marmoush', 'Hamza Abdel Karim'],
  },
  {
    teamLabel: 'Equador',
    goalkeepers: ['Hernan Galindez', 'Moises Ramirez', 'Gonzalo Valle'],
    outfield: ['Willian Pacho', 'Piero Hincapie', 'Joel Ordonez', 'Jackson Porozo', 'Felix Torres', 'Pervis Estupinan', 'Yaimar Medina', 'Angelo Preciado', 'Moises Caicedo', 'Jordy Alcivar', 'Pedro Vite', 'Denil Castillo', 'Alan Franco', 'Kendry Paez', 'Nilson Angulo', 'Gonzalo Plata', 'John Yeboah', 'Enner Valencia', 'Jordy Caicedo', 'Jeremy Arevalo', 'Anthony Valencia', 'Kevin Rodriguez'],
  },
  {
    teamLabel: 'Espanha',
    goalkeepers: ['Unai Simon', 'David Raya', 'Joan Garcia'],
    outfield: ['Cucurella', 'Grimaldo', 'Cubarsi', 'Laporte', 'Pubill', 'Eric Garcia', 'Marcos Llorente', 'Pedro Porro', 'Pedri', 'Fabian Ruiz', 'Zubimendi', 'Gavi', 'Rodri', 'Alex Baena', 'Merino', 'Oyarzabal', 'Dani Olmo', 'Nico Williams', 'Yeremy Pino', 'Ferran Torres', 'Borja Iglesias', 'Victor Munoz', 'Lamine Yamal'],
  },
  {
    teamLabel: 'Escocia',
    goalkeepers: ['Craig Gordon', 'Angus Gunn', 'Liam Kelly'],
    outfield: ['Grant Hanley', 'Jack Hendry', 'Aaron Hickey', 'Dom Hyam', 'Soctt McKenna', 'Nathan Patterson', 'Anthony Ralston', 'Andy Robertson', 'John Souttar', 'Kieran Tierney', 'Ryan Christie', 'Findlay Curtis', 'Lewis Fergunson', 'Ben Gannon-Doak', 'Billy Gilmour', 'John McGinn', 'Kenny McLean', 'Scott McTominay', 'Che Adams', 'Lyndon Dykes', 'George Hirst', 'Lawrence Shankland', 'Ross Steward'],
  },
  {
    teamLabel: 'Franca',
    goalkeepers: ['Mike Maignan', 'Robin Risser', 'Brice Samba'],
    outfield: ['Lucas Digne', 'Malo Gusto', 'Lucas Hernandez', 'Theo Hernandez', 'Ibrahima Konate', 'Jules Kounde', 'Maxence Lacroix', 'William Saliba', 'Dayot Upamecano', "N'Golo Kante", 'Manu Kone', 'Adrien Rabiot', 'Aurelien Tchouameni', 'Warren Zaire-Emery', 'Maghnes Akliouche', 'Bradley Barcola', 'Rayan Cherki', 'Ousmane Dembele', 'Desire Doue', 'Jean-Philippe Mateta', 'Kylian Mbappe', 'Michael Olise', 'Marcus Thuram'],
  },
  {
    teamLabel: 'Haiti',
    goalkeepers: ['Johnny Placide', 'Alexandre Pierre', 'Josue Duverger'],
    outfield: ['Carlens Arcus', 'Wilguens Pauguain', 'Duke Lacroix', 'Martin Experience', 'JK Duverne', 'Ricardo Ade', 'Hannes Delcroix', 'Keeto Thermoncy', 'Leverton Pierre', 'Carl-Fred Sainthe', 'Jean-Jacques Danley', 'Jeanricner Bellegarde', 'Pierre Woodenski', 'Dominique Simon', 'Louicius Deedson', 'Ruben Providence', 'Josue Casimir', 'Derrick Etienne', 'Wilson Isidor', 'Duckens Nazon', 'Frantzdy Pierrot', 'Yassin Fortune', 'Lenny Joseph'],
  },
  {
    teamLabel: 'Holanda',
    goalkeepers: ['Mark Flekken', 'Robin Roefs', 'Bart Verbruggen'],
    outfield: ['Nathan Ake', 'Virgil van Dijk', 'Denzel Dumfries', 'Jorrel Hato', 'Jan Paul van Hecke', 'Jurrien Timber', 'Micky van de Ven', 'Ryan Gravenberch', 'Frenkie de Jong', 'Teun Koopmeiners', 'Tijjani Reijnders', 'Marten de Roon', 'Guus Til', 'Quinten Timber', 'Mats Wieffer', 'Memphis Depay', 'Brian Brobbey', 'Cody Gakpo', 'Justin Kluivert', 'Noa Lang', 'Donyell Malen', 'Crysencio Summerville', 'Wout Weghorst'],
  },
  {
    teamLabel: 'Inglaterra',
    goalkeepers: ['Jordan Pickford', 'Dean Henderson', 'James Trafford'],
    outfield: ['Reece James', 'Ezri Konsa', 'Jarell Quansah', 'John Stones', 'Marc Guehi', 'Dan Burn', "Nico O'Reilly", 'Djed Spence', 'Tino Livramento', 'Declan Rice', 'Elliot Anderson', 'Kobbie Mainoo', 'Jordan Henderson', 'Morgan Rogers', 'Jude Bellingham', 'Eberechi Eze', 'Harry Kane', 'Ivan Toney', 'Ollie Watkins', 'Bukayo Saka', 'Marcus Rashford', 'Anthony Gordon', 'Noni Madueke'],
  },
  {
    teamLabel: 'Iraque',
    goalkeepers: ['Jalal Hassan', 'Ahmed Basil', 'Fahad Talib'],
    outfield: ['Mirkhas Doski', 'Ahmed Yahya', 'Manaf Younis', 'Akam Hashim', 'Zaid Tahsin', 'Rebin Sulaka', 'Frans Putros', 'Hussein Ali', 'Mustafa Saadoun', 'Aimar Sher', 'Zaid Ismail', 'Amir Al-Ammari', 'Kevin Yaqoub', 'Zidane Iqbal', 'Ahmed Qasim', 'Ibrahim Bayesh', 'Ali Jassim', 'Yousef Amin', 'Marco Faraj', 'Ali Al-Hamadi', 'Aymen Hussein', 'Mohanad Ali', 'Ali Youssef'],
  },
  {
    teamLabel: 'Japao',
    goalkeepers: ['Zion Suzuki', 'Keisuke Osako', 'Tomoki Hayakawa'],
    outfield: ['Hiroki Ito', 'Junnosuke Suzuki', 'Ayumu Seko', 'Shogo Taniguchi', 'Tsuyoshi Watanabe', 'Ko Itakura', 'Takehiro Tomiyasu', 'Yukinari Sugawara', 'Yuto Nagatomo', 'Daichi Kamada', 'Ao Tanaka', 'Kaishu Sano', 'Wataru Endo', 'Keito Nakamura', 'Daizen Maeda', 'Ritsu Doan', 'Yuito Suzuki', 'Junya Ito', 'Ayase Ueda', 'Koki Ogawa', 'Kento Shiogai', 'Keisuke Goto', 'Takefusa Kubo'],
  },
  {
    teamLabel: 'Marrocos',
    goalkeepers: ['Bounou', 'El Kajoui', 'Tagnaouti'],
    outfield: ['Mazraoui', 'Salah-Eddine', 'Belammari', 'Hakimi', 'El Ouahdi', 'Aguerd', 'Riad', 'Halhal', 'Diop', 'El Mourabet', 'Bouaddi', 'El Aynaoui', 'Amrabat', 'Ounahi', 'El Khannouss', 'Saibari', 'Ez Abde', 'Talbi', 'Rahimi', 'El Kaabi', 'Brahim Diaz', 'Gessime', 'Echghouyabe'],
  },
  {
    teamLabel: 'Mexico',
    goalkeepers: ['Raul Rangel', 'Carlos Acevedo', 'Guillermo Ochoa'],
    outfield: ['Jorge Sanchez', 'Cesar Montes', 'Edson Alvarez', 'Joah Vasquez', 'Erik Lira', 'Luis Romo', 'Israel Reyes', 'Mateo Chavez', 'Jesus Gallardo', 'Alvaro Fidalgo', 'Orbelin Pineda', 'Obed Vargas', 'Gilberto Mora', 'Cesar Huerta', 'Luis Chavez', 'Roberto Alvarado', 'Brian Gutierrez', 'Raul Jimenez', 'Alexis Veja', 'Santiago Gimenez', 'Armando Gonzalez', 'Julian Quinones', 'Guillermo Martinez'],
  },
  {
    teamLabel: 'Noruega',
    goalkeepers: ['Egil Selvik', 'Orjan Nyland', 'Sander Tangvik'],
    outfield: ['Kristoffer Ajer', 'Fredrik Bjorkan', 'Henrik Falchener', 'Sondre Langas', 'Torbjorn Heggem', 'Holmgren Pedersen', 'Julian Ryerson', 'Leo Ostigard', 'David Moller', 'Martin Odegaard', 'Patrick Berg', 'Kristian Thorstvedt', 'Thelo Aasgaard', 'Fredrik Aursnes', 'Sander Berge', 'Morten Thorsby', 'Strand Larsen', 'Oscar Bobb', 'Erling Haaland', 'Andreas Schjelderup', 'Jens Petter Hauge', 'Antonio Nusa', 'Alexander Sorloth'],
  },
  {
    teamLabel: 'Nova Zelandia',
    goalkeepers: ['Max Crocombe', 'Alex Paulsen', 'Michael Woud'],
    outfield: ['Tyler Bindon', 'Michael Boxall', 'Liberato Cacace', 'Francis de Vries', 'Callan Elliot', 'Tim Payne', 'Nando Pijnaker', 'Tommy Smith', 'Finn Surman', 'Lachlan Bayliss', 'Joe Bell', 'Matt Garbett', 'Ben Old', 'Alex Rufer', 'Sarpreet Singh', 'Marko Stamenic', 'Ryan Thomas', 'Kosta Barbarouses', 'Eli Just', 'Callum McCowatt', 'Jesse Randall', 'Ben Waine', 'Chris Wood'],
  },
  {
    teamLabel: 'Panama',
    goalkeepers: ['Orlando Mosquera', 'Luis Mejia', 'Cesar Samudio'],
    outfield: ['Cesar Blackman', 'Jorge Gutierrez', 'Amir Murillo', 'Fidel Escobar', 'Andres Andrade', 'Edgardo Farina', 'Jose Cordoba', 'Eric David', 'Jiovany Ramos', 'Roderick Miller', 'Anibal Godoy', 'Adalberto Carrasquilla', 'Carlos Harvey', 'Cristian Martinez', 'Jose Luis Rodriguez', 'Cesar Yanis', 'Yoel Barcenas', 'Alberto Quintero', 'Azarias Londono', 'Ismael Diaz', 'Cecilio Waterman', 'Jose Fajardo', 'Tomas Rodriguez'],
  },
  {
    teamLabel: 'Portugal',
    goalkeepers: ['Diogo Costa', 'Jose Sa', 'Rui Silva', 'Ricardo Velho'],
    outfield: ['Diogo Dalot', 'Matheus Nunes', 'Nelson Semedo', 'Joao Cancelo', 'Nuno Mendes', 'Goncalo Inacio', 'Renato Veiga', 'Ruben Dias', 'Tomas Araujo', 'Ruben Neves', 'Samuel Costa', 'Joao Neves', 'Vitinha', 'Bruno Fernandes', 'Bernardo Silva', 'Joao Felix', 'Trincao', 'Francisco Conceicao', 'Pedro Neto', 'Rafael Leao', 'Goncalo Guedes', 'Goncalo Ramos', 'Cristiano Ronaldo'],
  },
  {
    teamLabel: 'RD Congo',
    goalkeepers: ['Timothy Fayulu', 'Lionel Mpasi', 'Matthieu Epolo'],
    outfield: ['Aaron Wan-Bissaka', 'Gedeon Kalulu', 'Joris Kayembe', 'Arthur Masuaku', 'Steve Kapuadi', 'Rocky Bushiri', 'Axel Tuanzebe', 'Chancel Mbemba', 'Dylan Batubinsika', 'Noah Sadiki', 'Samuel Moutoussamy', 'Edo Kayembe', "Ngal'ayel Mukau", 'Charles Pickel', 'Nathanael Mbuku', 'Brian Cipenga', 'Theo Bongonda', 'Gael Kakuta', 'Meschack Elia', 'Fiston Mayele', 'Cedric Bakambu', 'Simon Banza', 'Yoane Wissa'],
  },
  {
    teamLabel: 'Republica Tcheca',
    goalkeepers: ['Luka Hornicek', 'Matej Kovar', 'Jindrich Stanek'],
    outfield: ['Vladimir Coufal', 'David Doudera', 'Toma Hole', 'Robin Hranac', 'Stepan Chaloupek', 'David Jurasek', 'Ladislav Krejci', 'Jaroslav Zeleny', 'David Zima', 'Luka Cerv', 'Vladimir Darida', 'Luka Provod', 'Michal Sadilek', 'Hugo Sochurek', 'Alexandr Sojka', 'Toma Soucek', 'Pavel Sulc', 'Denis Visinsky', 'Adam Hlozek', 'Toma Chory', 'Mojmir Chytil', 'Patrik Schick', 'Jan Kuchta'],
  },
  {
    teamLabel: 'Senegal',
    goalkeepers: ['Edouard Mendy', 'Mory Diaw', 'Yehvann Diouf'],
    outfield: ['Krepin Diatta', 'Antoine Mendy', 'Kalidou Koulibaly', 'El Hadji Malich Diouf', 'Mamadou Sarr', 'Moussa Niakhate', 'Moustapha Mbow', 'Abdoulaye Seck', 'Ismail Jakobs', 'Ilay Camara', 'Idrissa Gana Gueye', 'Pape Gueye', 'Lamine Camara', 'Habib Diarra', 'Pathe Ciss', 'Pape Matar Sarr', 'Bara Sapoko Ndiaye', 'Sadio Mane', 'Ismaila Sarr', 'Iliman Ndiaye', 'Assane Diao', 'Ibrahim Mbaye', 'Nicolas Jackson', 'Bamba Dieng', 'Cherif Ndiaye'],
  },
  {
    teamLabel: 'Suecia',
    goalkeepers: ['Viktor Johansson', 'Kristoffer Nordfeldt', 'Jacob Widell Zetterstrom'],
    outfield: ['Hjalmar Ekdal', 'Gabriel Gudmundsson', 'Isak Hien', 'Emil Holm', 'Gustaf Lagerbielke', 'Victor Nilsson Lindelof', 'Eric Smith', 'Carl Starfelt', 'Elliot Stroud', 'Daniel Svensson', 'Taha Ali', 'Yasin Ayari', 'Lucas Bergvall', 'Alexander Bernhardsson', 'Anthony Elanga', 'Viktor Gyokeres', 'Alexander Isak', 'Jesper Karlstrom', 'Gustaf Nilsson', 'Benjamin Nygren', 'Ken Sema', 'Mattias Svanberg', 'Besfort Zeneli'],
  },
  {
    teamLabel: 'Suica',
    goalkeepers: ['Marvin Keller', 'Gregor Kobel', 'Yvon Mvogo'],
    outfield: ['Manuel Akanji', 'Aurele Amenda', 'Eray Comert', 'Nico Elvedi', 'Luca Jaquez', 'Miro Muheim', 'Ricardo Rodriguez', 'Silvan Widmer', 'Michel Aebischer', 'Zeki Amdouni', 'Breel Embolo', 'Christian Fassnacht', 'Remo Freuler', 'Cedric Itten', 'Ardon Jashari', 'Johan Manzambi', 'Dan Ndoye', 'Noah Okafor', 'Fabian Rieder', 'Djibril Sow', 'Ruben Vargas', 'Grant Xhaka', 'Denis Zakaria'],
  },
  {
    teamLabel: 'Tunisia',
    goalkeepers: ['Dahmen', 'Chamakh', 'Ben Hassen'],
    outfield: ['Valery', 'Neffati', 'Bronn', 'Talbi', 'Rekik', 'Arous', 'Chikhaoui', 'Abdi', 'Ben Hmida', 'Skhiri', 'Mahmoud', 'Khedira', 'Ben Silmane', 'Ben Ouanes', 'Gharbi', 'Hannibal', 'Ayari', 'Achouri', 'Saad', 'Chaouat', 'Mastoui', 'Elloumi', 'Tonekti'],
  },
]

const OFFICIAL_ALL_PLAYER_OPTIONS = createOfficialSquadOptions(OFFICIAL_SQUADS, 'all')
const OFFICIAL_GOALKEEPER_OPTIONS = createOfficialSquadOptions(OFFICIAL_SQUADS, 'goalkeepers')

export const PLAYER_MARKET_OPTIONS: Partial<Record<OutrightMarketCode, PlayerMarketOption[]>> = {
  [OUTRIGHT_MARKET_CODES.TOP_SCORER]: mergePlayerMarketOptions([
    player('Kylian Mbappe', 'Franca', 'OFFICIAL', true),
    player('Vinicius Junior', 'Brasil', 'OFFICIAL', true),
    player('Harry Kane', 'Inglaterra', 'OFFICIAL', true),
    player('Lautaro Martinez', 'Argentina', 'OFFICIAL', true),
    player('Lamine Yamal', 'Espanha', 'OFFICIAL', true),
    player('Lionel Messi', 'Argentina', 'OFFICIAL'),
    player('Neymar', 'Brasil', 'OFFICIAL'),
    player('Erling Haaland', 'Noruega', 'LIKELY'),
    player('Viktor Gyokeres', 'Suecia', 'LIKELY'),
    player('Cristiano Ronaldo', 'Portugal', 'LIKELY'),
    player('Santiago Gimenez', 'Mexico', 'LIKELY'),
    player('Victor Osimhen', 'Nigeria', 'LIKELY'),
    player('Akram Afif', 'Catar', 'PRELIMINARY'),
    player('Aymen Hussein', 'Iraque', 'PRELIMINARY'),
    player('Arda Guler', 'Turquia', 'PRELIMINARY'),
  ], OFFICIAL_ALL_PLAYER_OPTIONS),
  [OUTRIGHT_MARKET_CODES.GOLDEN_BALL]: mergePlayerMarketOptions([
    player('Kylian Mbappe', 'Franca', 'OFFICIAL', true),
    player('Vinicius Junior', 'Brasil', 'OFFICIAL', true),
    player('Jude Bellingham', 'Inglaterra', 'OFFICIAL', true),
    player('Rodri', 'Espanha', 'OFFICIAL', true),
    player('Jamal Musiala', 'Alemanha', 'OFFICIAL', true),
    player('Lionel Messi', 'Argentina', 'OFFICIAL'),
    player('Neymar', 'Brasil', 'OFFICIAL'),
    player('Florian Wirtz', 'Alemanha', 'OFFICIAL'),
    player('Federico Valverde', 'Uruguai', 'LIKELY'),
    player('Khvicha Kvaratskhelia', 'Georgia', 'LIKELY'),
    player('Martin Odegaard', 'Noruega', 'LIKELY'),
    player('Kevin De Bruyne', 'Belgica', 'OFFICIAL'),
    player('Akram Afif', 'Catar', 'PRELIMINARY'),
    player('Kenan Yildiz', 'Turquia', 'PRELIMINARY'),
    player('Ali Jassim', 'Iraque', 'PRELIMINARY'),
  ], OFFICIAL_ALL_PLAYER_OPTIONS),
  [OUTRIGHT_MARKET_CODES.BEST_GOALKEEPER]: mergePlayerMarketOptions([
    player('Emiliano Martinez', 'Argentina', 'OFFICIAL', true),
    player('Alisson', 'Brasil', 'OFFICIAL', true),
    player('Mike Maignan', 'Franca', 'OFFICIAL', true),
    player('Unai Simon', 'Espanha', 'OFFICIAL', true),
    player('Gregor Kobel', 'Suica', 'OFFICIAL', true),
    player('Gianluigi Donnarumma', 'Italia', 'LIKELY'),
    player('Yassine Bounou', 'Marrocos', 'OFFICIAL'),
    player('Thibaut Courtois', 'Belgica', 'OFFICIAL'),
    player('Andre Onana', 'Camaroes', 'LIKELY'),
    player('Jalal Hassan', 'Iraque', 'PRELIMINARY'),
  ], OFFICIAL_GOALKEEPER_OPTIONS),
  [OUTRIGHT_MARKET_CODES.REVELATION]: mergePlayerMarketOptions([
    player('Lamine Yamal', 'Espanha', 'OFFICIAL', true),
    player('Endrick', 'Brasil', 'OFFICIAL', true),
    player('Estevao', 'Brasil', 'OFFICIAL', true),
    player('Kenan Yildiz', 'Turquia', 'PRELIMINARY', true),
    player('Pau Cubarsi', 'Espanha', 'OFFICIAL', true),
    player('Desire Doue', 'Franca', 'OFFICIAL'),
    player('Warren Zaire-Emery', 'Franca', 'OFFICIAL'),
    player('Kobbie Mainoo', 'Inglaterra', 'OFFICIAL'),
    player('Nico Paz', 'Argentina', 'OFFICIAL'),
    player('Franco Mastantuono', 'Argentina', 'LIKELY'),
    player('Kendry Paez', 'Equador', 'LIKELY'),
    player('Antonio Nusa', 'Noruega', 'LIKELY'),
    player('Ali Jassim', 'Iraque', 'PRELIMINARY'),
    player('Can Uzun', 'Turquia', 'PRELIMINARY'),
    player('Akram Afif', 'Catar', 'PRELIMINARY'),
  ], OFFICIAL_ALL_PLAYER_OPTIONS),
}
