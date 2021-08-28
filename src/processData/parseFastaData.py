"""
    Parse/convert FASTA files to csv files 
    with added processed data columns to build database.
    Since FASTA file is retrieved from uniprot.org, it is 
    better to create new database each time rather adding item row by row. 
"""

import PySimpleGUI as sg
import csv
import sys
import os
from datetime import datetime
from fasta2csv import converter

# file destination after processing
# humanFasta = 'D:\\HurdIT\\CysChemopedia\\src\\data\\HumanFasta.csv'
humanFasta = 'src/data/realdata/HumanFasta.csv'
mouseFasta = 'src/data/realdata/MouseFasta.csv'


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

        # writing the header
        if (header):
            csvwriter.writerow(header)

        # writing the data rows
        csvwriter.writerows(rows)


def createNewDatabase(filename, isHuman):
    fields = ["Entry", "Gene names (primary)",
              "Protein names", "Sequence", "Cysteine"]
    organism = "Homo sapiens" if (isHuman) else "Mus musculus"
    fileDest = humanFasta if (isHuman) else mouseFasta

    # Read in Fasta
    fasta = open(filename, 'r')
    fasta_lines = fasta.readlines()
    seq = {}
    seqs = []

    for line in fasta_lines:
        if line[0] == ">":  # head line with description
            seqs += [seq]  # adding dicitionary to broader list
            seq_local = {}
            seq_head = []
            # seperating the head's attributes
            seq_description = line[:line.index(" ")].strip(">\n").split("|")
            seq_head.append(seq_description[1])  # Entry
            seq_head.append(
                seq_description[2][:seq_description[2].index("_")])  # gene names
            seq_head.append(line[line.index(" "):line.find(
                "OS="+organism)].strip(" "))  # protein names
            seq_local["seq_type_list"] = seq_head
            seq_local["sequence"] = ""  # actual sequence
            seq = seq_local

        else:  # sequence line
            seq["sequence"] += line.strip("\n")

    fasta.close()

    # Convert fasta to csv
    seqs.pop(0)  # removing first (empty) item in seqs list
    
    rows = []
    for seq in seqs:
        csv_line = ""
        for type in seq["seq_type_list"]:
            csv_line += (type + ",")
        seq["seq_type_list"].append(seq["sequence"])
        seq["seq_type_list"].append(cysSeqPositions(seq["sequence"]))
        rows.append(seq["seq_type_list"])

    # Output CSV file
    writeToFile(fileDest, 'w+', fields, rows)


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
    window = sg.Window('Parse/convert FASTA file to CSV Data Files', layout, size=(600, 150))

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
        elif event == "Cancel":
            break

if __name__ == '__main__':
    main()
