import PySimpleGUI as sg
import csv
from datetime import datetime

# file destination after processing
fileDest = {
    "human": 'src/data/realdata/HumanCellData',
    "mouse": 'src/data/realdata/MouseCellData',
    "compound": 'D:\\HurdIT\\CysChemopedia\\src\\data\\realdata\\Compounds.csv'
}
# fixed values
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


def cleanNAandRegisterCompound(startPos, row, header, compound, organism):
    for index in range(startPos, len(row)):
        if (row[index] == "NA" or row[index] == "inf"):
            row[index] = ""
        elif (str(row[index]).strip() != ""):
            # register compound names
            if header[index] not in compound[organism]:
                compound[organism][header[index]] = [header[index], organism, index];
            # set ceiling value for new row if it exceeds
            if float(row[index]) > 20:
                row[index] = "20"


def mergeDuplicates(startPos, row1, row2):
    for index in range(startPos, len(row1)):
        # set ceiling value for new row if it exceeds
        if (row2[index] != "NA" and row2[index] != "inf" and str(row2[index]).strip() != "" and float(row2[index]) > 20):
            row2[index] = "20"

        # when both has values
        if(row1[index].strip() != "" and row2[index].strip() != "" and row2[index] != "NA" and row2[index] != "inf"):
            row1[index] = row2[index].strip() if (
                float(row1[index]) < float(row2[index])) else row1[index].strip()
            print(
                "Overlapping R value found while merging duplicates of site name ", row1[0])

        # when only new row has value
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
    newFileHeader = []
    header = []
    compoundNames = []
    compoundPos = []
    dest = ""
    collection = {}

    if (isHuman):
        compoundNames = getCompoundNames("human")
        dest = humanCell
    else:
        compoundNames = getCompoundNames("mouse")
        dest = mouseCell

    # reading current Cell Data file
    with open(dest, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        header = next(csvreader)

        # creating existing data as a collection
        for row in csvreader:
            id = row[header.index('site')]+"-"+row[header.index('cell_line')]
            collection[id] = row

        rows = list(collection.values())
        print("Number of rows before adding: %d" % (csvreader.line_num - 1))

    # reading to-be-add cell data csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # skip header
        newFileHeader = next(csvreader, None)

        # TODO: need to figure the compound stuff
        for name in compoundNames:
            compoundPos.append(header.index(name))

        siteColPos = newFileHeader.index('site')
        geneSymPos = newFileHeader.index('gene_symbol')
        cellLineColPos = newFileHeader.index('cell_line')

        # extract each data row one by one
        for row in csvreader:
            newRow = [row[siteColPos]]
            newRow.append(getSiteCys(row[siteColPos]))
            newRow.append(getEntry(row[siteColPos]))
            newRow[len(newRow):] = row[geneSymPos:cellLineColPos]

            isEngaged = checkEngaged(row, compoundPos)
            row.append(isEngaged)
            compoundColPos = len(newRow)

            for compound in newFileHeader[compoundColPos:len(newFileHeader)]:
                cleanNA(compoundColPos, row)
                newRow.insert(header.index(compound),
                              row[newFileHeader.index(compound)])

            id = row[siteColPos]+"-"+row[cellLineColPos]

            if id in collection:
                modRow = mergeDuplicates(
                    compoundColPos, collection.get(id), newRow)
                collection[id] = modRow
            else:
                collection[id] = newRow

        # get total number of rows
        print("Number of rows added: %d" % (csvreader.line_num - 1))
        # print("Total number of rows in : %d" % (len(rows)))

    rows = list(collection.values())
    file = humanCell if (isHuman) else mouseCell
    writeToFile(file, 'w+', header, rows)


def createNewDatabase(filename):
    header = []
    compoundNames = []
    compoundPos = []
    collection = {'mouse': {}, 'human': {}}
    compound = {'mouse': {}, 'human': {}}
    cellDataHeader = {'mouse': {}, 'human': {}}

    # reading csv file
    with open(filename, 'r') as csvfile:
        # creating a csv reader object
        csvreader = csv.reader(csvfile)

        # extracting field names through first row
        header = next(csvreader)

        for name in compoundNames:
            if name in header:
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
            organism = row[organismColPos]
            row.pop(organismColPos)

            isEngaged = checkEngaged(row, compoundPos)
            row.insert(engageColPos, isEngaged)

            id = row[siteColPos]+"-"+row[cellLineColPos]
            if id in collection[organism]:
                modRow = mergeDuplicates(
                    engageColPos+1, collection.get(id), row)
                collection[organism][id] = modRow
            else:
                cleanNAandRegisterCompound(engageColPos+1, row, header, compound, organism)
                collection[organism][id] = row

        # get total number of rows
        print("Total no. of rows in : %d" % (csvreader.line_num - 1))

    # print compound list
    compoundHeader = ["name", "type", "orginal_order"]
    allCompounds = []
    for organism in collection:
        compoundList = list(compound[organism].values())
        compoundList.sort()
        allCompounds += compoundList
    writeToFile(fileDest["compound"], 'w+', compoundHeader, allCompounds)        

    # delete human compound cols on mouse collection
    mouseCompoundList = list(compound["mouse"].values())
    mouseCompoundList.sort(key=lambda x:x[2])
    mouseCompoundPos = mouseCompoundList[0][2]
    for key, value in collection["mouse"].items():
        del value[engageColPos+1:mouseCompoundPos]

    # adjust header
    cellDataHeader["human"]  = header[0:mouseCompoundPos]
    cellDataHeader["mouse"]  = header[-mouseCompoundPos::engageColPos+1]
    # print separated cell data for each organism
    for organism in collection:
        rows = list(collection[organism].values())
        writeToFile(fileDest[organism], 'w+', cellDataHeader[organism], rows)


def main():
    sg.theme("DarkBlue9")
    layout = [[sg.T("")],
              [sg.Text("Choose a file: "), sg.Input(),
               sg.FileBrowse(key="-IN-")],
              [sg.Button("Add To Database"), sg.Button("Create New Database"), sg.Button("Cancel")]]

    # Building Window
    window = sg.Window('Prep Cell Data', layout, size=(600, 150))

    while True:
        event, values = window.read()
        if event == sg.WIN_CLOSED or event == "Exit":
            break
        elif event == "Create New Database":
            createNewDatabase(values["-IN-"])
            break
        elif event == "Add To Database":
            addToDatabase(values["-IN-"])
            break
        elif event == "Cancel":
            break


if __name__ == '__main__':
    main()
