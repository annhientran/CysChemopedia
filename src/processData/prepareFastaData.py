"""
    This file is to prep Fasta csv files to 
    generate a new one with added processed data columns
"""

import PySimpleGUI as sg
import csv
from datetime import datetime

humanFasta = 'assets/data/HumanFasta'
mouseFasta = 'assets/data/MouseFasta'

def cysSeqPositions(seq):
    if not seq:
        return ''
    else:
        posArr = []
        for i in range(len(seq)):
            if seq[i] == 'C':
                posArr.append(str(i+1))

        return ';'.join(posArr)

def writeToFile(dest, action, header, rows):
    now = datetime.now().strftime("%m-%d-%Y-%H%M%S")

    # write to new empty csv file
    with open(dest+"-"+now+".csv", action, newline='') as csvfile:
        # creating a csv writer object
        csvwriter = csv.writer(csvfile)

        # writing the fields
        csvwriter.writerow(header)

        # writing the data rows
        csvwriter.writerows(rows)
        
# TODO: test
def addToDatabase(filename, isHuman):
    rows = []
    fields = []

    # reading csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        if fields:
            fields = next(csvreader)
        seqColPos = fields.index('Sequence')

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            row.append(cysSeqPositions(row[seqColPos]))
            rows.append(row)

        # get total number of rows
        print("Total no. of rows: %d" % (csvreader.line_num - 1))

    file = humanFasta if (isHuman) else mouseFasta
    writeToFile(file, 'a+', '', rows)


def createNewDatabase(filename, isHuman):
    rows = []
    fields = []

    # reading csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        fields = next(csvreader)
        fields.append('Cysteine')
        seqColPos = fields.index('Sequence')

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            row.append(cysSeqPositions(row[seqColPos]))
            rows.append(row)

        # get total number of rows
        print("Total no. of rows in database: %d" % (csvreader.line_num - 1))

    file = humanFasta if (isHuman) else mouseFasta
    writeToFile(file, 'w+', fields, rows)

def main():
    sg.theme("DarkBlue9")
    type = True
    radio = [sg.Radio('Human', "type", default=True, key="-IN2-"),
             sg.Radio('Mouse', "type", default=False)]
    layout = [[sg.T("")],
              [sg.Text("Choose a file: "), sg.Input(),
               sg.FileBrowse(key="-IN-")],
              radio,
              [sg.Button("Add To Database"), sg.Button("Create New Database"), sg.Button("Cancel")]]

    # Building Window
    window = sg.Window('Prep Fasta Data', layout, size=(600, 150))

    while True:
        event, values = window.read()
        if event == sg.WIN_CLOSED or event == "Exit":
            break
        elif event == "Create New Database":
            createNewDatabase(values["-IN-"], values["-IN2-"])
            break
        elif event == "Add To Database":
            addToDatabase(values["-IN-"], values["-IN2-"])
            break


if __name__ == '__main__':
    main()
