import genanki
import random
import os
import argparse
import codecs


from os import listdir
from os.path import isfile, join

parser = argparse.ArgumentParser(description='Moving media files to Anki decks')

parser.add_argument('--folder_to_anki', action="store", dest='folder_to_anki', default=0)
parser.add_argument('--media_id', action="store", dest='media_id', default=0)

args = parser.parse_args()

def collection_to_anki_deck(deck_name, media_id):

  print('1')
  temp_file_path='/Users/akramrasikh/projects/anki-card-creator-server/output-files/' + media_id
  model_id = int(str(random.getrandbits(64))[:8])
  deck_id = int(str(random.getrandbits(64))[:8])
  randomNumber = str(random.getrandbits(64))[:4]
  print(model_id)
  print(deck_id)


  anki_deck_path = os.path.abspath(temp_file_path)

  onlyfiles = [f for f in listdir(anki_deck_path) if isfile(join(anki_deck_path, f))]

  def check_if_viable(file):
      if file == '.DS_Store':
            return False
      return True

  viable_files = sorted(list(filter(check_if_viable, onlyfiles)))
  print('## pre-viable_files')
  print(viable_files)
  audio_template=codecs.open("./audio-template-python.html", 'r')
  html_string = audio_template.read()
  print('## post-viable_files')

  audioCard = viable_files[0]
  textCard = viable_files[1]
  my_model = genanki.Model(
    model_id,
    'Simple Model (tobira-textbook)',
    fields=[
      {'name': 'Front'},
      {'name': 'Back'},
    ],
    templates=[
      {
        'name': 'Card 1',
        'qfmt': "<img src={{Front}}></img>",
        'afmt': html_string,
      },
    ])
  my_deck = genanki.Deck(
    deck_id,
    deck_name)

  my_note = genanki.Note(
  model=my_model,
  fields=[textCard, audioCard])

  my_deck.add_note(my_note)

  genanki.Package(my_deck).write_to_file('./anki-folder/' + deck_name + randomNumber + '.apkg')

collection_to_anki_deck(args.folder_to_anki, args.media_id)
