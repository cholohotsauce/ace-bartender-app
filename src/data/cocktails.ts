export type Cocktail = {
  name: string
  ingredients: string
  instructions: string
  glassware?: string
  garnish?: string
}

export const cocktails: Cocktail[] = [
  {
    name: 'El Zubron',
    ingredients:
      '1.25 oz Zubrowka bison grass vodka, 1 oz white port, 0.75 oz Krupnik, Full dropper marjoram tincture, 5 drops rosemary tincture, Dash of celery bitters',
    instructions:
      'Stir. Serve in a rocks glass with a big ice cube. Garnish with a lemon peel.',
    glassware: 'Rocks Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'White Linen',
    ingredients:
      '1.5 oz gin, 0.75 oz lime juice, 0.5 oz St. Germaine, 0.5 oz simple syrup, 4 or 5 cucumber sections',
    instructions:
      'Muddle cucumber. Shake and double strain. Serve in a highball glass with rocks. Top with soda.',
    glassware: 'Highball Glass',
    garnish: 'None',
  },
  {
    name: 'Whisky Sour',
    ingredients:
      '2 oz bourbon, 3/4 oz lemon juice, 1/2 oz simple syrup, Egg white, Angostura garnish',
    instructions: 'Shake. Double strain.',
    glassware: 'Coupe Glass',
    garnish: 'Angostura',
  },
  {
    name: 'SAZERAC',
    ingredients:
      '2.5 oz rye, 1 brown sugar cube, 4 dashes peychaud’s bitters, Absinthe wash',
    instructions:
      'Muddle cube with bitters and tiny splash of soda. Stir with rye until very cold. Strain into cold, absinthe-washed water glass (No Rocks). Garnish with a lemon peel.',
    glassware: 'Water Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'Negroni',
    ingredients:
      '1 oz gin, 1 oz Campari, 1 oz red vermouth, 3 dashes of Angostura bitters',
    instructions:
      'Stir. Serve in a rocks glass with a big cube. Garnish with an orange peel.',
    glassware: 'Rocks Glass',
    garnish: 'Orange Peel',
  },
  {
    name: 'Old Fashioned',
    ingredients:
      '2 oz bourbon, 1 brown sugar cube, 3 dashes of Angostura bitters',
    instructions:
      'Muddle sugar cube with bitters and a tiny splash of soda. Add bourbon. Stir. Serve in a rocks glass with a big cube. Garnish with an orange peel.',
    glassware: 'Rocks Glass',
    garnish: 'Orange Peel',
  },
  {
    name: 'Margarita',
    ingredients:
      '2 oz tequila blanco, 0.75 oz dry curacao, 0.75 - 1 oz lime juice, 0.5 oz simple syrup',
    instructions:
      'Shake. Serve in a salt-rimmed rocks glass with rocks. Garnish with a lime wedge or wheel.',
    glassware: 'Rocks Glass',
    garnish: 'Lime Wedge or Wheel',
  },
  {
    name: 'Manhattan',
    ingredients:
      '2 oz bourbon, 1 oz red vermouth, 4 dashes of Angostura bitters',
    instructions:
      'Stir. Serve in a chilled coupe or Nick and Nora glass. Garnish with a cherry.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Cherry',
  },
  {
    name: 'El Vuelve a la Vida 231',
    ingredients:
      '0.75 oz cilantro mezcal, 0.5 oz regular mezcal, 1 oz vermouth bianco, 0.75 oz dry curacao, 0.75 oz lime juice',
    instructions:
      'Shake, double strain. Serve in a chilled Nick and Nora glass. Add 2 spritzes of absinthe. Garnish with a lime wedge or wheel.',
    glassware: 'Nick & Nora Glass',
    garnish: 'Lime wedge or wheel',
  },
  {
    name: 'True Romance',
    ingredients:
      '1.5 oz mezcal, 1 oz yellow Chartreuse, 0.75 oz Amaro Averna, Juice of 1 lime wedge, Nip of salt',
    instructions:
      'Stir. Serve in a rocks glass with a big cube. Garnish with a lime peel, wedge, or wheel.',
    glassware: 'Rocks Glass',
    garnish: 'Lime Peel, Wedge, or Wheel',
  },
  {
    name: 'El Sirviente',
    ingredients:
      '1.25 oz gin, 0.75 oz yellow Chartreuse, 0.75 oz lime juice, 0.75 oz chamomile syrup, 5 drops anise tincture, 5 drops saffron Tincture, egg white',
    instructions:
      'Dry shake, then shake with ice, double strain. Serve in a chilled Nick and Nora glass. Garnish with a lime peel, wedge, or wheel.',
    glassware: 'Nick & Nora Glass',
    garnish: 'Lime Peel, Wedge, or Wheel',
  },
  {
    name: 'El Doctor',
    ingredients:
      '1 oz gin, 0.75 oz Cynar, 0.5 oz St. Germain, 0.5 oz manzanilla brine, 0.5 oz lemon juice, 5 drops rosemary bitters, Tonic water (to top)',
    instructions:
      'Shake all ingredients except tonic. Pour over ice in a wine glass. Fill with tonic water and garnish with a lemon peel.',
    glassware: 'Wine Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'Sidecar',
    ingredients:
      '2 oz cognac, 0.75 oz dry curacao, 0.75 oz lemon juice, 0.5 oz rich simple syrup, 1 dash Angostura bitters',
    instructions: 'Shake, double strain. Serve in a sugar-rimmed, chilled coupe or Nick and Nora glass. Garnish with an orange peel.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Orange Peel',
  },
  {
    name: 'El Araguato',
    ingredients:
      "2 oz Lot 40, 0.75 oz Diplomatico rum, 0.5 oz Campari, 0.5 oz pomegranate/cherry syrup, 3 dashes Peychaud's bitters, 3 sprays absinthe",
    instructions:
      'Stir with ice. Double strain into a chilled coupe. Garnish with a lemon peel.',
    glassware: 'Chilled Coupe',
    garnish: 'Lemon Peel',
  },
  {
    name: 'El Puerto Secreto',
    ingredients:
      '1 oz spiced gin, 0.75 oz port, 0.75 oz honey syrup, 0.75 oz lemon juice, 4 dashes of orange bitters',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with a lemon peel.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'Penicillin',
    ingredients:
      '2 oz blended scotch, 0.75 oz lemon juice, 0.75 oz honey syrup, 0.25 oz Dun Bheagan scotch',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with candied ginger or lemon peel.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Candied Ginger or Lemon Peel',
  },
  {
    name: 'El Pelican',
    ingredients:
      '1.5 oz bourbon, 1 oz sake, 1 oz pear juice, 0.5 oz ginger syrup, 1 or 2 drops sesame oil, Splash of lemon juice, Egg white',
    instructions:
      'Dry shake, then shake with ice, double strain. Serve in a chilled large Nick and Nora glass. Garnish with a lemon peel.',
    glassware: 'Large Nick & Nora Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'Paper Plane',
    ingredients:
      '0.75 oz bourbon, 0.75 oz Aperol, 0.75 oz Amaro Montenegro, 0.75 oz lemon juice',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with a paper plane.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Paper Plane',
  },
  {
    name: 'El Origami',
    ingredients:
      '1 oz Japanese single malt whiskey, 1 oz lemon juice, 0.75 oz apricot brandy, 0.75 oz sake, 0.75 oz amaretto',
    instructions:
      'Shake, double strain. Serve in a rocks glass with a big cube. Garnish with an origami crane or lemon peel.',
    glassware: 'Rocks Glass',
    garnish: 'Origami Crane or Lemon Peel',
  },
  {
    name: 'El Oaxacan Haze',
    ingredients:
      '1 oz blended scotch, 0.75 oz lime juice, 0.5 oz mezcal, 0.5 oz agave syrup, 4 or 5 mint leaves',
    instructions:
      'Muddle mint leaves. Shake, double strain. Serve in an absinthe-washed rocks glass with a big cube. Garnish with mint.',
    glassware: 'Absinthe-Washed Rocks Glass',
    garnish: 'Mint',
  },
  {
    name: 'Negroni Bianco',
    ingredients:
      '1 oz gin, 1 oz Luxardo Bitter Bianco, 1 oz Lillet Blanc or Cocchi Americano Bianco, 3 dashes of orange bitters',
    instructions:
      'Stir. Serve in a rocks glass with a big cube. Garnish with an orange peel.',
    glassware: 'Rocks Glass',
    garnish: 'Orange Peel',
  },
  {
    name: 'Naked and Famous',
    ingredients:
      '0.75 oz mezcal, 0.75 oz Aperol, 0.75 oz yellow Chartreuse, 0.75 oz lime juice',
    instructions:
      'Shake, double strain. Serve in a chilled coupe. Garnish with a half lime wheel.',
    glassware: 'Coupe Glass',
    garnish: '½ Lime Wheel',
  },
  {
    name: 'Monte Cassino',
    ingredients:
      '0.75 oz rye, 0.75 oz yellow Chartreuse, 0.75 oz Benedictine, 0.75 oz lemon juice',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with a lemon peel.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Lemon Peel',
  },
  {
    name: 'Mimosa',
    ingredients:
      '60/40 ratio of prosecco and orange juice',
    instructions:
      'Pour into a flute glass. Garnish with an orange wedge.',
    glassware: 'Flute Glass',
    garnish: 'Orange Wedge',
  },
  {
    name: 'Martini (Dry as Default)',
    ingredients:
      '2.5 oz gin or vodka, 0.5 oz dry vermouth',
    instructions:
      'Stir. Serve in a chilled Nick and Nora glass. Garnish with olives or a lemon twist.',
    glassware: 'Nick and Nora Glass',
    garnish: 'Olives or Lemon Twist',
  },
  {
    name: 'Last Word',
    ingredients:
      '1.25 oz gin, 0.75 oz green Chartreuse, 0.75 oz lime juice, 0.5 oz maraschino liqueur',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with a cherry.',
    glassware: 'Coupe or Nick & Nora Glass',
    garnish: 'Cherry (Traditional version: Equal parts each ingredient)',
  },
  {
    name: 'El Johnny Poncho',
    ingredients:
      '4 oz El Johnny Poncho mix, 1 oz dark rum, 1 oz white rum',
    instructions:
      'Shake. Serve in a tiki glass with rocks. Garnish with an umbrella and straw.',
    glassware: 'Tiki Glass',
    garnish: 'Umbrella & Straw',
  },
  {
    name: 'El Jefecito',
    ingredients:
      '60/40 prosecco/El Jefe mix',
    instructions:
      'Serve in a flute glass. Garnish with a lime wedge.',
    glassware: 'Flute',
    garnish: 'Lime Wedge',
  },
  {
    name: 'El Jefe',
    ingredients:
      '3 oz El Jefe mix, 1 oz tequila blanco, 0.5 oz mezcal',
    instructions:
      'Shake. Serve in a highball glass with rocks. Garnish with a lime wedge or wheel & sumac, straw.',
    glassware: 'Highball Glass',
    garnish: 'Lime Wedge or Wheel & Sumac, Straw',
  },
  {
    name: 'El Guce',
    ingredients:
      '1.5 oz rye, 0.5 oz Chambord, 0.5 oz Frangelico, 10 drops garam masala tincture, 4 drops sticky toffee tincture, 3 drops espresso, Nip of salt',
    instructions:
      'Muddle sugar cube and salt with tinctures and 0.5 oz liquor ingredients. Add the remaining ingredients. Shake, double strain. Serve in a rocks glass with a big cube. Garnish with an orange wheel.',
    glassware: 'Rocks Glass',
    garnish: 'Orange Wheel',
  },
  {
    name: 'French 75',
    ingredients:
      '1 oz gin, 0.5 oz lemon juice, 0.5 oz simple syrup',
    instructions:
      'Fill ½ flute with prosecco. Shake ingredients briefly, double strain into flute. Garnish with a lemon twist or peel.',
    glassware: 'Flute Glass',
    garnish: 'Lemon Twist or Peel',
  },
  {
    name: 'Espresso Martini',
    ingredients:
      '1.5 oz brandy, 1 shot espresso, 0.5 oz espresso liqueur, 0.5 oz demerara syrup or simple syrup, Dash of cardamom or mole bitters',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with espresso beans (optional).',
    glassware: 'Chilled Coupe or Nick and Nora Glass',
    garnish: 'Espresso Beans (optional)',
  },
  {
    name: 'Carajillo',
    ingredients:
      '1.5 oz reposado tequila, 1 oz Licor 43, 1 oz espresso',
    instructions:
      'Shake, double strain. Serve in a chilled coupe.',
    glassware: 'Chilled Coupe',
    garnish: 'None',
  },
  {
    name: 'Boulevardier',
    ingredients:
      '1 oz bourbon, 1 oz Campari, 1 oz red vermouth',
    instructions:
      'Stir. Serve in a rocks glass with a big cube. Garnish with an orange peel.',
    glassware: 'Rocks Glass',
    garnish: 'Orange Peel',
  },
  {
    name: 'Brandy Alexander',
    ingredients:
      '1.25 oz brandy, 1 oz heavy cream, 0.75 oz crème de cacao',
    instructions:
      'Shake, double strain. Serve in a chilled coupe. Garnish with grated nutmeg.',
    glassware: 'Chilled Coupe',
    garnish: 'Grated Nutmeg',
  },
  {
    name: 'Aviation',
    ingredients:
      '2 oz gin, 0.75 oz lemon juice, 0.5 oz maraschino liqueur, 0.25 oz crème de violette',
    instructions:
      'Shake, double strain. Serve in a chilled coupe or Nick and Nora glass. Garnish with a cherry.',
    glassware: 'Chilled Coupe or Nick and Nora Glass',
    garnish: 'Cherry',
  },
  {
    name: 'El Cardy B',
    ingredients:
      '1.25 oz Becherovka, 0.5 oz Dun Bheagan scotch, 0.5 oz toasted cardamom syrup, 0.5 oz dry curacao, 0.25 oz or splash of malt vinegar, Dash of Angostura bitters',
    instructions:
      'Shake, double strain. Serve in a rocks glass with a big cube. Garnish with a clementine wheel.',
    glassware: 'Rocks Glass',
    garnish: 'Clementine Wheel',
  },
  {
    name: 'El Francisco',
    ingredients:
      '1 oz mezcal, 1 oz dry curacao, 1 oz Fernet Francisco, Juice of 1 lime wedge, Nip of salt',
    instructions:
      'Stir. Serve in a rocks glass with a big cube. Add 2 spritzes of absinthe. Garnish with a lime or orange peel, wedge, or wheel.',
    glassware: 'Rocks Glass',
    garnish: 'Lime or Orange Peel, Wedge, or Wheel',
  },
  {
    name: 'Ace Caesar',
    ingredients:
      '1 oz tequila, 1 oz pickle juice, 0.5 oz mezcal, 0.5 oz Worcestershire sauce, Large pinch of horseradish, Pinch of celery salt, Hot sauce to taste',
    instructions:
      'Celery salt-rimmed 16 oz pint glass, rocks. Top with Walters mix. Garnish with a celery stalk, lemon and lime wedge, and straw.',
    glassware: '16 oz Pint Glass',
    garnish: 'Celery Stalk, Lemon and Lime Wedge, Straw',
  },
  {
    name: 'Aperol Spritz',
    ingredients:
      '2 oz prosecco, 1.5 oz Aperol, Hearty dash of Angostura bitters',
    instructions:
      'Serve in a large wine glass with rocks. Top with soda. Garnish with an orange wheel or peel.',
    glassware: 'Large Wine Glass',
    garnish: 'Orange Wheel or Peel',
  },
]