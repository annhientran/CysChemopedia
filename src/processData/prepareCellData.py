import PySimpleGUI as sg
import csv
from datetime import datetime

humanCell = 'src/data/realdata/HumanCellData'
mouseCell = 'src/data/realdata/MouseCellData'
compoundList = 'D:\\HurdIT\\CysChemopedia\\src\\data\\realdata\\Compounds.csv'
engagedVal = 1.5
isEngaged = 1
isMapped = 0

"""
    Return the uniprot accession with isoform 
    extracted from site column
"""


def getEntry(site):
    com = site.split("|")
    return com[1]


def getSiteCys(site):
    if not site:
        return ''
    else:
        cysStart = site.rfind("_") + 1
        return site[cysStart:len(site)]


def checkEngaged(site, compoundPos):
    for pos in compoundPos:
        if (site[pos] != 'NA' and site[pos].strip() != '' and float(site[pos]) >= engagedVal):
            return isEngaged

    return isMapped


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


def cleanNA(startPos, row):
    for index in range(startPos, len(row)):
        if (row[index] == "NA" or row[index] == "inf"):
            row[index] = ""


def mergeDuplicates(startPos, row1, row2):
    for index in range(startPos, len(row1)):
        if(row1[index].strip() != "" and row2[index].strip() != "" and row2[index] != "NA" and row2[index] != "inf"):
            row1[index] = row2[index].strip() if (
                float(row1[index]) < float(row2[index])) else row1[index].strip()
            print(
                "Overlapping R value found while merging duplicates of site name ", row1[0])
        elif (row1[index].strip() == "" and row2[index].strip() != "" and row2[index] != "NA" and row2[index] != "inf"):
            row1[index] = row2[index].strip()

    return row1


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

# TODO: test


def addToDatabase(filename, isHuman):
    rows = []
    currheader = []
    header = []
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
        currheader = next(csvreader)

        print("Number of rows before adding: %d" % (csvreader.line_num - 1))

    # reading new csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # skip header
        next(csvreader, None)

        for name in compoundNames:
            compoundPos.append(header.index(name))

        siteColPos = header.index('site')

        # extracting each data row one by one
        # get Sequence C Positions from each Cysteine and add to row
        for row in csvreader:
            isEngaged = checkEngaged(row, compoundPos)
            row.insert(currheader.index('cysteine'),
                       getSiteCys(row[siteColPos]))
            row.insert(currheader.index('engaged'), isEngaged)
            rows.append(row)

        # get total number of rows
        print("Number of rows added: %d" % (csvreader.line_num - 1))
        # print("Total number of rows in : %d" % (len(rows)))

    writeToFile(dest, 'a+', '', rows)


def createNewDatabase(filename, isHuman):
    header = []
    compoundNames = []
    compoundPos = []
    collection = {}

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
        header = next(csvreader)

        # one client provided file had protein id instead of uniprot accession
        # so need to produce uniprot accession col
        # pid = header.index('protein_id')
        # header.insert(pid, 'uniprot_accession')
        # for row in csvreader:
        # s = row[pid].find('|') + 1
        # e = row[pid].find('|', s)
        # uniprot_accession = row[pid][s:e]
        # row.insert(pid,uniprot_accession)
        # rows.append(row)

        for name in compoundNames:
            compoundPos.append(header.index(name))

        siteColPos = header.index('site')

        # create CYSTEINE column header next to SITE column
        header.insert(siteColPos + 1, 'cysteine')

        uniprotColPos = header.index('uniprot_accession')

        # create ENTRY (canonical & isoform) column header next to UNIPROT_ACCESSION column
        entryColPos = uniprotColPos + 1
        header.insert(entryColPos, 'entry')

        # delete UNIPROT_ACCESSION and ORGANISM columns
        header.pop(uniprotColPos)
        organismColPos = header.index('organism')
        header.pop(organismColPos)

        # create ENGAGE column header next to CELL_LINE column
        cellLineColPos = header.index('cell_line')
        engageColPos = header.index('cell_line') + 1
        header.insert(engageColPos, 'engaged')

        # extract each data row one by one
        for row in csvreader:
            row.insert(siteColPos + 1, getSiteCys(row[siteColPos]))
            row.insert(entryColPos, getEntry(row[siteColPos]))
            row.pop(uniprotColPos)
            row.pop(organismColPos)

            isEngaged = checkEngaged(row, compoundPos)
            row.insert(engageColPos, isEngaged)

            id = row[siteColPos]+"-"+row[cellLineColPos]
            if id in collection:
                modRow = mergeDuplicates(
                    engageColPos+1, collection.get(id), row)
                collection[id] = modRow
            else:
                cleanNA(engageColPos, row)
                collection[id] = row

        # get total number of rows
        print("Total no. of rows in : %d" % (csvreader.line_num - 1))

    rows = list(collection.values())
    file = humanCell if (isHuman) else mouseCell
    writeToFile(file, 'w+', header, rows)


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
