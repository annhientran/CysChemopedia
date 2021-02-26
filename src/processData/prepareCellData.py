import PySimpleGUI as sg
import csv
from datetime import datetime

humanCell = 'src/data/realdata/HumanCellData'
mouseCell = 'src/data/realdata/MouseCellData'
compoundList = 'D:\\HurdIT\\CysChemopedia\\src\\data\\realdata\\initial\\Compounds.csv'
engagedVal = 2
mappedVal = 1


def getSiteCys(site):
    if not site:
        return ''
    else:
        cysStart = site.rfind("_") + 1
        return site[cysStart:len(site)]


def checkEngaged(site, compoundPos):
    for pos in compoundPos:
        if (site[pos] != 'NA' and float(site[pos]) >= 1.5):
            return engagedVal

    return mappedVal


def getCompoundNames(type):
    nameList = []

    # reading csv file
    with open(compoundList, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # skip field names on first row
        next(csvreader, None)

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            if (row[0] == type):
                nameList.append(row[1])

    return nameList


def writeToFile(dest, action, header, rows):
    now = datetime.now().strftime("%m-%d-%Y-%H%M%S")

    # write to new empty csv file
    with open(dest+"-"+now+".csv", action, newline='') as csvfile:
        # creating a csv writer object
        csvwriter = csv.writer(csvfile)

        # writing the fields
        if (header):
            csvwriter.writerow(header)

        # writing the data rows
        csvwriter.writerows(rows)

# TODO: test


def addToDatabase(filename, isHuman):
    rows = []
    currfields = []
    fields = []
    compoundNames = []
    compoundPos = []
    dest = ""

    if (isHuman):
        compoundNames = getCompoundNames("human")
        dest = humanCell
    else:
        compoundNames = getCompoundNames("mouse")
        dest = mouseCell

    # reading current Human Cell file
    with open(dest, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        currfields = next(csvreader)

        print("Number of rows before adding: %d" % (csvreader.line_num - 1))

    # reading new csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # skip header
        next(csvreader, None)

        for name in compoundNames:
            compoundPos.append(fields.index(name))

        siteColPos = fields.index('site')

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            isEngaged = checkEngaged(row, compoundPos)
            row.insert(currfields.index('cysteine'),
                       getSiteCys(row[siteColPos]))
            row.insert(currfields.index('engaged'), isEngaged)
            rows.append(row)

        # get total number of rows
        print("Number of rows added: %d" % (csvreader.line_num - 1))
        # print("Total number of rows in : %d" % (len(rows)))

    writeToFile(dest, 'a+', '', rows)


def createNewDatabase(filename, isHuman):
    rows = []
    fields = []
    compoundNames = []
    compoundPos = []

    if (isHuman):
        compoundNames = getCompoundNames("human")
        dest = humanCell
    else:
        compoundNames = getCompoundNames("mouse")
        dest = mouseCell

    # reading csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        fields = next(csvreader)
        # pid = fields.index('protein_id')
        # fields.insert(pid, 'uniprot_accession')
        # for row in csvreader:
            # s = row[pid].find('|') + 1
            # e = row[pid].find('|', s)
            # uniprot_accession = row[pid][s:e]
            # row.insert(pid,uniprot_accession)
            # rows.append(row)

        for name in compoundNames:
            compoundPos.append(fields.index(name))

        siteColPos = fields.index('site')
        fields.insert(siteColPos + 1, 'cysteine')
        engagedColPos = fields.index('cell_line') + 1
        fields.insert(engagedColPos, 'engaged')

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            isEngaged = checkEngaged(row, compoundPos)
            row.insert(siteColPos + 1, getSiteCys(row[siteColPos]))
            row.insert(engagedColPos, isEngaged)
            rows.append(row)

        # get total number of rows
        print("Total no. of rows in : %d" % (csvreader.line_num - 1))

    file = humanCell if (isHuman) else mouseCell
    writeToFile(file, 'w+', fields, rows)


def main():
    sg.theme("DarkBlue9")
    radio = [sg.Radio('Human', "type", default=True, key="-IN2-"),
             sg.Radio('Mouse', "type", default=False)]
    layout = [[sg.T("")],
              [sg.Text("Choose a file: "), sg.Input(),
               sg.FileBrowse(key="-IN-")],
              radio,
              [sg.Button("Add To Database"), sg.Button("Create New Database"), sg.Button("Cancel")]]

    # Building Window
    window = sg.Window('Prep Cell Data', layout, size=(600, 150))

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
